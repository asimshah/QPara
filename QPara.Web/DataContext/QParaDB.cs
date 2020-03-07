using Fastnet.Core;
using Fastnet.Core.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara.Data
{
    public class QParaDbInitialiser
    {
        public static void Initialise(QParaDb db)
        {
            var dbOptions = db.Database.GetService<IOptions<QParaDbOptions>>().Value;
            var options = db.Database.GetService<IOptions<QParaOptions>>().Value;
            var log = db.Database.GetService<ILogger<QParaDbInitialiser>>() as ILogger;
            var creator = db.Database.GetService<IDatabaseCreator>() as RelationalDatabaseCreator;
            var dbExists = creator.Exists();

            if (dbExists)
            {
                log.Debug("QParaDb exists");
            }
            else
            {
                log.Warning("No QParaDb found");
            }
            var pendingMigrations = db.Database.GetPendingMigrations();
            db.Database.Migrate();
            log.Trace("The following migrations have been applied:");
            var migrations = db.Database.GetAppliedMigrations();
            foreach (var migration in migrations)
            {
                log.Trace($"\t{migration}");
            }
            if (pendingMigrations.Count() > 0 || dbOptions.ForceV2DataConversion)
            {
                // V2DataConversion applies if there any pending migrations at all
                db.RunV2DataConversion(pendingMigrations.Count(), dbOptions, options, log);
            }
            db.Validate(log);
        }
    }
    public class QParaDbOptions //: WebDbOptions
    {
        public bool AddMissingJoinedOnDates { get; set; }
        public bool SplitMultipleMemberships { get; set; }
        public bool ForceV2DataConversion { get; set; }
        public bool ReloadMembers { get; set; } // temporary
        public QParaDbOptions()
        {

        }
    }
    public class QParaDb : DbContext
    {
        public DbSet<Member> Members { get; set; }
        public DbSet<Zone> Zones { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<NoteLine> NoteLines { get; set; }
        public DbSet<PaymentNote> PaymentNotes { get; set; }
        public DbSet<MemberNote> MemberNotes { get; set; }
        public DbSet<Change> Changes { get; set; }
        public QParaDb(DbContextOptions<QParaDb> contextOptions) : base(contextOptions)
        {

        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("qp");

            modelBuilder.Entity<Member>()
                .HasOne(x => x.Zone)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.ZoneId);

            modelBuilder.Entity<MemberNote>()
                .HasKey(x => new { x.MemberId, x.NoteId });

            modelBuilder.Entity<MemberNote>()
                .HasOne(x => x.Member)
                .WithMany(x => x.MemberNotes)
                .HasForeignKey(x => x.MemberId);

            modelBuilder.Entity<MemberNote>()
                .HasOne(x => x.Note)
                .WithMany(x => x.MemberNotes)
                .HasForeignKey(x => x.NoteId);

            modelBuilder.Entity<Payment>()
                .HasOne(x => x.Member)
                .WithMany(x => x.Payments)
                .HasForeignKey(x => x.MemberId);

            modelBuilder.Entity<PaymentNote>()
                .HasKey(x => new { x.PaymentId, x.NoteId });

            modelBuilder.Entity<PaymentNote>()
                .HasOne(x => x.Payment)
                .WithMany(x => x.PaymentNotes)
                .HasForeignKey(x => x.PaymentId);

            modelBuilder.Entity<PaymentNote>()
                .HasOne(x => x.Note)
                .WithMany(x => x.PaymentNotes)
                .HasForeignKey(x => x.NoteId);

            base.OnModelCreating(modelBuilder);
        }
        public void RunV2DataConversion(int newMigrationCount, QParaDbOptions qpDbOptions, QParaOptions qpOptions, ILogger log)
        {

            //if (qpDbOptions.DisableDataConversion)
            //{
            //    log.Information($"DataConversion is disabled");
            //}
            //else
            //{
            log.Information($"V2 DataConversion running with {newMigrationCount} new migrations");
            var members = this.Members
                .Include(x => x.Payments).ThenInclude(x => x.PaymentNotes).ThenInclude(x => x.Note)
                .Include(x => x.MemberNotes).ThenInclude(x => x.Note)
                .Include(x => x.Changes)
                ;
            RemoveExtraneousMembers(members, log);
            log.Information($"V2 DataConversion: extraneous members removed");
            ConvertPaymentsToSubscriptionYears(members, log);
            log.Information($"V2 DataConversion: payments converted to subscriptions years");

            if (qpDbOptions.ReloadMembers)
            {
                this.ChangeTracker.AutoDetectChangesEnabled = false;
                using (new TimedAction(t => log.Information($"member reload complete = {t.ToString("c")}")))
                {
                    foreach (var m in members)
                    {
                        this.Entry(m).Reload();
                    }
                }
                this.ChangeTracker.AutoDetectChangesEnabled = true;
            }
            UpdatePaymentStatus(members, qpOptions, log);
            log.Information($"V2 DataConversion: payment status for all members updated");
            if (qpDbOptions.AddMissingJoinedOnDates)
            {
                AddMissingJoinedOnDates(members, log);
                log.Information($"V2 DataConversion: joined on dates added where possible");
            }
            if (qpDbOptions.SplitMultipleMemberships)
            {
                //SplitMultipleMemberships(members, log);
            }
            log.Information($"V2 DataConversion finished");
            //}
        }
        private void UpdatePaymentStatus(IIncludableQueryable<Member, ICollection<Change>> members, QParaOptions options, ILogger log)
        {
            this.ChangeTracker.AutoDetectChangesEnabled = false;
            var selectedMembers = members
                .Where(x => x.SubscriptionPeriod != SubscriptionPeriod.Life
                    && (x.SubscriptionType == SubscriptionType.Standard || x.SubscriptionType == SubscriptionType.Concession))
                ;
            var notSelectedMembers = members.Except(selectedMembers).Where(x => !x.GetIsPaid(options)/*!x.IsPaid*/);
            foreach (var m in notSelectedMembers.ToArray())
            {
                if (m.AmountDue != 0 || m.AmountReceived != 0)
                {
                    m.AmountDue = m.AmountReceived = 0;
                    log.Information($"{m.FirstName} {m.LastName} due and received amounts reset (to 0)");
                    //SaveChanges();
                }
            }
            var subscriptionYear = options.GetSubscriptionYear(DateTimeOffset.UtcNow);
            foreach (var m in selectedMembers.ToArray())
            {
                m.UpdatePaymentRecords(options, true);
                //SaveChanges();
            }
            ChangeTracker.DetectChanges();
            SaveChanges();
            this.ChangeTracker.AutoDetectChangesEnabled = true;
        }
        private void ConvertPaymentsToSubscriptionYears(IIncludableQueryable<Member, ICollection<Change>> members, ILogger log)
        {
            this.ChangeTracker.AutoDetectChangesEnabled = false;
            var selectedMembers = members.Where(x => x.Payments.Count() > 0 && x.Payments.Any(p => string.IsNullOrWhiteSpace(p.SubscriptionYear)));
            foreach (var m in selectedMembers.ToArray())
            {
                foreach (var payment in m.Payments.ToArray())
                {
                    var year = payment.DueDate.Year;
                    //var month = payment.DueDate.Month;
                    var subscriptionYear = $"{year}/{(year + 1) % 2000}";
                    payment.SubscriptionYear = subscriptionYear;
                }
                log.Information($"{m.FirstName} {m.LastName} subscription years updated");
                //SaveChanges();
            }
            this.ChangeTracker.DetectChanges();
            this.SaveChanges();
            this.ChangeTracker.AutoDetectChangesEnabled = true;
        }
        private void RemoveExtraneousMembers(IIncludableQueryable<Member, ICollection<Change>> members, ILogger log)
        {
            foreach (var m in members.Where(x => x.FirstName.StartsWith("(") && x.FirstName.EndsWith(")")).ToArray())
            {
                Delete(m);
                this.SaveChanges();
                log.Information($"delete member {m.Name}?");
            }

        }
        private void AddMissingJoinedOnDates(IIncludableQueryable<Member, ICollection<Change>> members, ILogger log)
        {
            this.ChangeTracker.AutoDetectChangesEnabled = false;
            foreach (var m in members.ToArray().Where(x => x.JoinedOn == null && !x.HasLeft && x.Payments.Count() > 0).ToArray())
            {
                var ep = m.Payments.OrderBy(x => x.DueDate).FirstOrDefault().DueDate;
                if (ep != null)
                {
                    m.JoinedOn = ep;
                    var cr = new Change
                    {
                        Date = DateTimeOffset.Now,
                        MadeBy = "System",
                        Member = m,
                        Description = $"Joined on date {ep.ToDefault()} taken from payment record"
                    };
                    m.Changes.Add(cr);
                    //this.SaveChanges();
                    log.Information($"set member {m.Name} joining date to {ep.ToDefault()}");
                }
            }
            this.ChangeTracker.DetectChanges();
            this.SaveChanges();
            this.ChangeTracker.AutoDetectChangesEnabled = true;
        }
        private void SplitMultipleMemberships(IIncludableQueryable<Member, ICollection<Change>> members, ILogger log)
        {
            foreach (var m in members.ToArray().Where(x => x.MemberCount > 1 && !x.HasLeft).ToArray())
            {
                var (fn1, ln1, fn2, ln2) = Splitnames(m);
                var email1 = "none";
                var email2 = "none";
                if (!string.IsNullOrWhiteSpace(m.Email))
                {
                    m.Email = m.Email.Replace("\n", " ");
                    (email1, email2) = SplitEmails(m);
                }
                log.Trace($"split \"{m.Name} ({m.Email})\" into \"{fn1} {ln1} ({email1})\" and \"{fn2} {ln2} ({email2})\"");
            }
        }
        private (string email1, string email2) SplitEmails(Member m)
        {

            if (string.IsNullOrWhiteSpace(m.Email))
            {
                return ("", "");
            }
            var separators = new string[] { " ", ";" };
            var parts = m.Email.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2)
            {
                return (parts[0].Trim(), parts[1].Trim());
            }
            else
            {
                return (parts[0].Trim(), parts[0].Trim());
            }
        }
        private (string fn1, string ln1, string fn2, string ln2) Splitnames(Member m)
        {
            var separators = new string[] { "&", "and" };
            var parts = m.FirstName.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2)
            {
                return (parts[0].Trim(), m.LastName, parts[1].Trim(), m.LastName);
            }
            else
            {
                return (m.FirstName, m.LastName, m.FirstName, m.LastName);
            }
        }
        private void Delete(Member m)
        {
            foreach (var p in m.Payments)
            {
                foreach (var pn in p.PaymentNotes)
                {
                    this.Notes.Remove(pn.Note);
                }
                this.PaymentNotes.RemoveRange(p.PaymentNotes);
            }
            this.Payments.RemoveRange(m.Payments);
            foreach (var mn in m.MemberNotes)
            {
                this.Notes.Remove(mn.Note);
            }
            this.MemberNotes.RemoveRange(m.MemberNotes);
            this.Changes.RemoveRange(m.Changes);
            this.Members.Remove(m);
        }

        internal void Validate(ILogger log)
        {
            var invalidZones = this.Members.Where(x => x.IsAssociate && x.ZoneNumber != 19);
            foreach(var m in invalidZones)
            {
                m.IsAssociate = false;
                log.Warning($"Member {m.Name} is an associate but is in zone {m.ZoneNumber}, repaired");
            }
            var invalidAssociateFlag = this.Members.Where(x => !x.IsAssociate && x.ZoneNumber == 19);
            foreach (var m in invalidAssociateFlag)
            {
                m.IsAssociate = true;
                log.Warning($"Member {m.Name} is in zone {m.ZoneNumber} but is not an associate, repaired");
            }
            var invalidMemberZones = this.Members.Where(x => x.Zone == null);
            foreach(var m in invalidMemberZones)
            {
                if(m.ZoneNumber > 0)
                {
                    m.Zone = this.Zones.Single(x => x.Number == m.ZoneNumber);
                    log.Warning($"Member {m.Name} zone is null - corrected to Zone {m.Zone.Number}");
                }
                else
                {
                    log.Error($"Member {m.Name} zone is null - cannot correct as zone number is {m.ZoneNumber}");
                }
            }
            SaveChanges();
            var prob = this.Members.SingleOrDefault(x => x.Id == 367);
            if(prob != null)
            {
                var ld = prob.LeftOn.Value;
                if(ld.Year < 2000)
                {
                    prob.LeftOn = new DateTimeOffset(2018, 5, 24, 0, 0, 0, TimeSpan.Zero);
                    SaveChanges();
                    log.Warning($"Problematic member {prob.Name} left on date corrected");
                }
            }
            foreach(var m in Members)
            {
                if (!string.IsNullOrWhiteSpace(m.Email))
                {
                    if(m.Email.Contains(",com"))
                    {
                        m.Email = m.Email.Replace(",com", ".com").Replace("\n", "").Replace("\r", "");
                        
                    }
                    var list = new List<string>();
                    var parts = m.Email.Trim().Split(new char[] { ';', ',', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var part in parts)
                    {
                        list.Add(part.Trim());
                    }
                    if(list.Count() > 1)
                    {                        
                        if(list.Count() == 2)
                        {
                            m.Email = list.First().Trim();
                            m.SecondEmail = list.Skip(1).First().Trim();
                            log.Information($"Member {m.Name} set Email to {m.Email}, second Email to {m.SecondEmail}");
                        }
                        else
                        {
                            log.Warning($"Member {m.Name} has suspect email address {m.Email}");
                        }
                    }
                }
            }
            SaveChanges();
            
        }
    }
}
