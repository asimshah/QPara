using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Controllers;
using Fastnet.QPara;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using mc_model = MailChimp.Net.Models;

namespace QPara.Web.Controllers
{
    [Authorize]
    [Route("membership")]
    [ApiController]
    public class MembershipController : BaseController
    {
        private readonly MailChimpService mailchimpService;
        private readonly QParaOptions options;
        private readonly QParaDb db;
        public MembershipController(MailChimpService mailchimpService, ILogger<MembershipController> logger, IOptionsMonitor<QParaOptions> qpoptionsMonitor,
            QParaDb db, IWebHostEnvironment env) : base(logger, env)
        {
            this.options = qpoptionsMonitor.CurrentValue;
            this.db = db;
            this.mailchimpService = mailchimpService;
        }
        [HttpGet("get/documentlist")]
        public IActionResult GetDocumentList()
        {
            return SuccessResult(this.options.DocumentList);
        }
        [HttpGet("get/document/{index}")]
        public IActionResult GetDocument(int index)
        {
            var item = options.DocumentList[index];
            var filename = Path.Combine(this.environment.ContentRootPath, item.FullPath);
            log.Information($"Requested {index.ToString()}, path = {filename}, mime = {item.MimeType}");
            var stream = System.IO.File.OpenRead(filename);
            var cd = new System.Net.Mime.ContentDisposition
            {
                FileName = Path.GetFileName(filename),
                DispositionType = "attachment"
            };
            Response.Headers.Add("Content-Disposition", cd.ToString());
            return new FileStreamResult(stream, new MediaTypeHeaderValue(item.MimeType));
        }
        [HttpGet("get/zones")]
        public async Task<IActionResult> GetZoneList()
        {
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            var zones = await db.Zones.OrderBy(z => z.Number).ToArrayAsync();
            return SuccessResult(zones.Select(x => x.ToDTO()));
        }
        [HttpGet("get/subscription/years")]
        public IActionResult GetSubscriptionYears()
        {
            var dto = new SubscriptionYearsDTO();
            var startofYear = options.GetFirstDayOfYear(DateTimeOffset.Now);
            int year = startofYear.Year;
            dto.SubscriptionYears = new List<string>();
            for (int i = year + options.SubscriptionYearFrom; i < year + options.SubscriptionYearTo; ++i)
            {
                dto.SubscriptionYears.Add(options.GetSubscriptionYear(i));
            }
            dto.CurrentSubscriptionYear = options.GetCurrentSubscriptionYear();
            return SuccessResult(dto);
        }
        [HttpGet("get/parameters/V2")]
        public IActionResult GetParametersV2()
        {
            //db.ChangeTracker.AutoDetectChangesEnabled = false;
            //var zones = await db.Zones
            //    .OrderBy(z => z.Number).ToArrayAsync();
            //var startofYear = options.GetFirstDayOfYear(DateTimeOffset.Now);
            //int year = startofYear.Year;
            //var subscriptionYears = new List<string>();
            //for (int i = year + options.SubscriptionYearFrom; i < year + options.SubscriptionYearTo; ++i)
            //{
            //    subscriptionYears.Add(options.GetSubscriptionYear(i));
            //}
            var p = new Parameters
            {
                //CurrentSubscriptionYear = options.GetCurrentSubscriptionYear(),//.GetSubscriptionYear(year),
                //SubscriptionYears = subscriptionYears.ToArray(),
                //Zones = zones,
                ShowEmailAsMailToLink = options.ShowEmailAsMailToLink
            };
            return SuccessResult(p);
        }
        [HttpPost("post/members/v2/sheet")]
        public async Task<IActionResult> PostMembersV2Sheet()
        {
            var localCopy = false;// true;
            var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            var columnList = await this.Request.FromBody<ColumnMetadata[]>();
            using (new TimedAction((t) => log.Debug($"post members v2 sheet completed in {t.ToString("c")}")))
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var members = GetMemberList(columnList);
                var now = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, ukTime);
                //var nowString = now.ToDefaultWithTime()
                //    .Replace(" ", "-")
                //    .Replace(":", "-");

                var sheetName = $"Member List";
                var sheetTitle = $"Selected Member List {now.ToDefaultWithTime()}";
                // *NB* make sure there a no spaces in the file name
                var file = Path.Combine(this.environment.ContentRootPath, "Data", "Sheets", $"Member-List.xlsx");
                file = TimestampFilename(file);
                if (localCopy)
                {
                    members.CreateSheetToFile(options, sheetName, new string[] { sheetTitle }, columnList, file);
                    log.Trace($"created file {file}");
                }
                var ms = members.CreateSheetToMemoryStream(options, sheetName, new string[] { sheetTitle }, columnList);
                ms.Seek(0, SeekOrigin.Begin);
                log.Trace($"excel sheet prepared ... returning with filename {file}");
                var cd = new System.Net.Mime.ContentDisposition
                {
                    FileName = Path.GetFileName(file),
                    DispositionType = "attachment"
                };
                Response.Headers.Add("Content-Disposition", cd.ToString());
                return new FileStreamResult(ms, new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            }
        }
        [HttpPost("post/members/v2")]
        public async Task<IActionResult> PostMembersV2()
        {
            var uerProfile = User.GetProfile();
            var columnData = await this.Request.FromBody<ColumnMetadata[]>();
            try
            {
                await Task.Delay(0);

                using (new TimedAction((t) => log.Information($"post members v2 completed in {t.ToString("c")}")))
                {
                    db.ChangeTracker.AutoDetectChangesEnabled = false;
                    var members = GetMemberListAsDTO(columnData);
                    return SuccessResult(members);
                }
            }
            catch (Exception xe)
            {
                log.Error(xe);
                Debugger.Break();
                throw;
            }
        }
        [HttpGet("get/streetreplist")]
        public async Task<IActionResult> GetStreetRepList()
        {
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            var reps = await db.Zones
                .Include(z => z.StreetRep)
                .Select(x => new StreetRep { Member = x.StreetRep, Zone = x })
                .ToArrayAsync();
            //.SingleAsync(x => x.Number == zn);
            var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            var now = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, ukTime);
            var nowString = now.ToDefaultWithTime()
                .Replace(" ", "-")
                .Replace(":", "-");
            var filename = $"Street Rep List-{nowString}.xlsx";
            var title = $"QPARA STREET REPRESENTATIVES as at {now.ToDefaultWithTime()}";
            var sheet = reps.CreateStreetRepSheetToMemoryStream("QPara Street Reps", new string[] { title });
            sheet.Seek(0, SeekOrigin.Begin);
            return File(sheet, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
        }
        private string TimestampFilename(string filename)
        {
            if (this.options.TimestampDownloadFilenames)
            {
                var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
                var now = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, ukTime);
                var nowString = now.ToDefaultWithTime()
                    .Replace(" ", "-")
                    .Replace(":", "-");
                var name = $"{Path.GetFileNameWithoutExtension(filename)}-{nowString}";
                filename = Path.Combine(name, Path.GetExtension(filename));
            }
            return filename;
        }
        [HttpGet("get/sheet/{zn}/{id}")]
        public async Task<IActionResult> GetStandardSheet(int zn, int id)
        {
            //var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            var stdList = (StandardLists)id;
            using (new TimedAction(t => log.Debug($"get standard sheet {stdList.ToString()} for zone {zn} completed in {t.ToString("c")}")))
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var zone = await db.Zones.Include(z => z.StreetRep)
                    .SingleAsync(x => x.Number == zn);
                StandardMemberList sml = null;
                switch (stdList)
                {
                    case StandardLists.ZoneMembers:
                        sml = new ZoneMembers(zn);
                        break;
                    case StandardLists.ZoneMinutes:
                        sml = new ZoneMinutes(zn);
                        break;
                    case StandardLists.ZonePaymentsOutstanding:
                        sml = new ZonePaymentsOutstanding(zn);
                        break;
                }
                var columns = sml.GetColumns().ToArray();
                var sheetName = $"{stdList.ToDescription()}";
                var listNameForFile = stdList.ToDescription().Replace(" ", "-");
                //var now = TimeZoneInfo.ConvertTime(DateTimeOffset.Now, ukTime);
                //var nowString = now.ToDefaultWithTime()
                //    .Replace(" ", "-")
                //    .Replace(":", "-");
                //var filename = $"Zone-{zn}-{listNameForFile}-{nowString}.xlsx";
                var filename = TimestampFilename( $"Zone-{zn}-{listNameForFile}.xlsx");
                var title = $"Zone {zone.Number}, {zone.Description} - {stdList.ToDescription()} as at {DateTime.Now.ToDefaultWithTime()}";
                var subtitle = $"{zone.StreetRepDescription}";
                IEnumerable<Member> members = GetMemberList(columns);
                members = members.OrderByStreetAddress();
                var sheet = members.CreateSheetToMemoryStream(options, sheetName, new string[] { title, subtitle }, columns);
                sheet.Seek(0, SeekOrigin.Begin);
                return File(sheet, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
        }
        [HttpGet("check/email/{email}")]
        public async Task<IActionResult> CheckEmailInUse(string email)
        {
            using (new TimedAction(t => log.Debug($"check email completed in {t.ToString("c")}")))
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var result = await db.Members.Where(x => x.Email.ToLower() == email.ToLower())
                    .ToArrayAsync();
                var count = result.Count();
                if (count == 0)
                {
                    result = await db.Members.Where(x => x.MemberCount > 1 && x.SecondEmail.ToLower() == email.ToLower())
                        .ToArrayAsync();
                    count = count = result.Count();
                }
                return SuccessResult(count > 0); // true if in use
            }
        }
        [HttpGet("get/addresses/all")]
        public IActionResult GetAllAdresses()
        {
            using (new TimedAction(t => log.Debug($"get full address list completed in {t.ToString("c")}")))
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var sml = new FullMemberList();
                var columns = sml.GetColumns().ToArray();
                var addresses = GetMemberList(columns)
                    .Where(x => !string.IsNullOrWhiteSpace(x.Email) || !string.IsNullOrWhiteSpace(x.SecondEmail))
                    .SelectMany(x => x.GetEmailAddresses())
                    .ToArray();
                var result = new EmailAddresses
                {
                    AddressesForMembers = addresses,
                };
                return SuccessResult(result);
            }
        }
        [HttpGet("get/addresses/{zn}")]
        public async Task<IActionResult> GetAdressLists(int zn)
        {
            Func<StandardMemberList, string[]> getAddresses = (sml) =>
            {
                var columns = sml.GetColumns().ToArray();
                return GetMemberList(columns)
                    .Where(x => !string.IsNullOrWhiteSpace(x.Email) || !string.IsNullOrWhiteSpace(x.SecondEmail))
                    .SelectMany(x => x.GetEmailAddresses())
                    .ToArray();
            };
            using (new TimedAction(t => log.Debug($"get address lists for zone {zn} completed in {t.ToString("c")}")))
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var zone = await db.Zones.Include(z => z.StreetRep)
                    .SingleAsync(x => x.Number == zn);
                var result = new EmailAddresses
                {
                    AddressesForMembers = getAddresses(new ZoneMembers(zn)),
                    AddressesForMinutes = getAddresses(new ZoneEmailMinutes(zn)),
                    AddressesForPaymentsOutstanding = getAddresses(new ZonePaymentsOutstanding(zn))
                };
                return SuccessResult(result);
            }
        }
        [HttpGet("get/member/v2/{id}")]
        public async Task<IActionResult> GetMemberV2(int id)
        {
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            var m = await db.Members
                .Include(x => x.Payments).ThenInclude(x => x.PaymentNotes).ThenInclude(x => x.Note).ThenInclude(x => x.NoteLines)
                .Include(x => x.MemberNotes).ThenInclude(x => x.Note).ThenInclude(x => x.NoteLines)
                .Include(x => x.Changes)
                .SingleAsync(x => x.Id == id)
                ;
            return SuccessResult(m.ToDTO(this.options, true, true, true));
        }
        [HttpPost("post/update/member/v2")]
        public async Task<IActionResult> UpdateMemberV2([FromBody] MemberDTO memberDTO)
        {
            Debug.Assert(memberDTO.Id > 0);
            var member = await db.Members
                .Include(x => x.Payments).ThenInclude(x => x.PaymentNotes)
                .Include(x => x.Changes)
                .Include(x => x.MemberNotes)
                .SingleOrDefaultAsync(x => x.Id == memberDTO.Id);
            if (member != null)
            {
                var changes = member.FromDTO(memberDTO, User.Identity.Name);
                foreach (var c in changes)
                {
                    var change = new Change
                    {
                        Date = c.Time,
                        Member = member,
                        MadeBy = c.By,
                        Description = c.Description
                    };
                    member.Changes.Add(change);
                }
                member.UpdatePaymentRecords(options, true);
                await db.SaveChangesAsync();
                var mr = new MemberResult { MemberId = member.Id };
                if (options.MailChimpEnabled)
                {
                    var results = await this.mailchimpService.AddOrUpdateMemberAsync(member);
                    ProcessMailChimpResults(mr, results);
                }
                return SuccessResult(mr);
            }
            else
            {
                return ErrorResult($"Member id {memberDTO.Id} not found");
            }
        }
        [HttpPost("post/new/member/v2")]
        public async Task<IActionResult> CreateNewMemberV2([FromBody] MemberDTO nm)
        {
            var now = DateTimeOffset.Now;
            var member = new Member();
            var changes = member.FromDTO(nm, User.Identity.Name);
            member.Zone = db.Zones.SingleOrDefault(z => z.Number == member.ZoneNumber);
            var newMemberChanges = changes.Where(x => x.RecordForNewMember);
            foreach (var c in newMemberChanges)
            {
                var change = new Change
                {
                    Date = c.Time,
                    Member = member,
                    MadeBy = c.By,
                    Description = c.Description
                };
                member.Changes.Add(change);
            }
            member.Changes.Add(new Change
            {
                Date = now,
                Member = member,
                MadeBy = User.Identity.Name,
                Description = $"new member created"
            });

            member.UpdatePaymentRecords(options, false);
            await db.Members.AddAsync(member);
            await db.SaveChangesAsync();
            var mr = new MemberResult { MemberId = member.Id };
            if (options.MailChimpEnabled)
            {
                var results = await this.mailchimpService.AddOrUpdateMemberAsync(member);

                ProcessMailChimpResults(mr, results);
            }
            return SuccessResult(mr);
        }

        private void ProcessMailChimpResults(MemberResult mr, IEnumerable<MailChimpServiceResult> results)
        {
            foreach (var r in results)
            {
                switch (r.Response)
                {
                    case MailChimpServiceResponse.Normal:
                        break;
                    case MailChimpServiceResponse.Error:
                        mr.Messages.Add($"Mailchimp update failed: {r.Exception.Message}");
                        break;
                    case MailChimpServiceResponse.IsUnsubscribed:
                        mr.Messages.Add($"{r.Contact.EmailAddress} is unsubscribed at Mailchimp - check if member has left, or does not want email delivery of minutes (or resubscribe!)");
                        break;
                    case MailChimpServiceResponse.NotArchived:
                        mr.Messages.Add($"{r.Contact.EmailAddress} not archived, current status is {r.Contact.Status}");
                        break;
                }
            }
        }

        [HttpGet("delete/member/v2/{id}")]
        public async Task<IActionResult> DeleteMemberV2(int id)
        {
            Debug.Assert(id > 0);
            var member = await db.Members
                .Include(x => x.Payments).ThenInclude(x => x.PaymentNotes).ThenInclude(x => x.Note)
                .Include(x => x.MemberNotes).ThenInclude(x => x.Note)
                .Include(x => x.Changes)
                .SingleOrDefaultAsync(x => x.Id == id);
            if (member != null)
            {
                foreach (var payment in member.Payments.ToArray())
                {
                    foreach (var pn in payment.PaymentNotes.ToArray())
                    {
                        db.Notes.Remove(pn.Note);
                        db.PaymentNotes.Remove(pn);
                    }
                    db.Payments.Remove(payment);
                }
                foreach (var mn in member.MemberNotes.ToArray())
                {
                    db.Notes.Remove(mn.Note);
                    db.MemberNotes.Remove(mn);
                }
                foreach (var change in member.Changes.ToArray())
                {
                    db.Changes.Remove(change);
                }
                db.Members.Remove(member);
                await db.Changes.AddAsync(new Change
                {
                    Date = DateTimeOffset.Now,
                    MadeBy = User.Identity.Name,
                    Description = $"Member {member.FirstName} {member.LastName} ({id}) deleted"
                });
                await db.SaveChangesAsync();
                var mr = new MemberResult { MemberId = member.Id };
                if (options.MailChimpEnabled)
                {
                    var results = await this.mailchimpService.DeleteMemberAsync(member);
                    ProcessMailChimpResults(mr, results);
                }
                return SuccessResult(mr);
            }
            return ErrorResult($"Member {id} not found");
        }
        [HttpGet("get/member/v2/{id}/changes")]
        public async Task<IActionResult> GetMemberChangesV2(int id)
        {
            var changes = await db.Changes
                .Where(x => x.MemberId == id)
                .OrderByDescending(x => x.Date)
                .Select(x => x.ToDTO())
                .ToArrayAsync();
            return SuccessResult(changes);
        }
        [HttpGet("get/stats/v2")]
        public IActionResult GetMembershipStatsV2()
        {
            //AnalyseMembership();
            using (new TimedAction(t => log.Debug($"get statistics completed in {t.ToString("c")}")))
            {
                var stats = new Statistics();
                var allMembers = db.Members.ToArray()
                .Where(x => !x.HasLeft /*&& !x.IsSuspended*/)
                .ToArray();

                stats.Counts.FullMembers.Annual.Complimentary =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Complimentary).Sum(m => m.MemberCount);
                stats.Counts.FullMembers.Annual.Concession =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Concession).Sum(m => m.MemberCount);
                stats.Counts.FullMembers.Annual.Standard =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Standard).Sum(m => m.MemberCount);
                stats.Counts.FullMembers.Life.Complimentary =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Complimentary).Sum(m => m.MemberCount);
                stats.Counts.FullMembers.Life.Concession =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Concession).Sum(m => m.MemberCount);
                stats.Counts.FullMembers.Life.Standard =
                    allMembers.Where(m => !IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Standard).Sum(m => m.MemberCount);

                stats.Counts.Associates.Annual.Complimentary =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Complimentary).Sum(m => m.MemberCount);
                stats.Counts.Associates.Annual.Concession =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Concession).Sum(m => m.MemberCount);
                stats.Counts.Associates.Annual.Standard =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Annual && m.SubscriptionType == SubscriptionType.Standard).Sum(m => m.MemberCount);
                stats.Counts.Associates.Life.Complimentary =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Complimentary).Sum(m => m.MemberCount);
                stats.Counts.Associates.Life.Concession =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Concession).Sum(m => m.MemberCount);
                stats.Counts.Associates.Life.Standard =
                    allMembers.Where(m => IfAssociate(m) && m.SubscriptionPeriod == SubscriptionPeriod.Life && m.SubscriptionType == SubscriptionType.Standard).Sum(m => m.MemberCount);

                stats.Messages = new List<string>();
                var suspendedMemberCount = db.Members.ToArray().Where(x => !x.HasLeft && x.IsSuspended).Sum(x => x.MemberCount);
                stats.Messages.Add($"There are {suspendedMemberCount} suspended members.");
                var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
                var today = DateTimeOffset.UtcNow;
                var day = (DateTimeOffset)db.Members.Where(m => m.JoinedOn != null).Min(m => m.JoinedOn);
                bool finished = false;
                allMembers = db.Members.ToArray();
                var leaversAndJoiners = new List<LeaverJoiners>();
                int index = 0;
                int totalMembers = 0;
                int totalAssociates = 0;
                while (!finished)
                {
                    var yearStart = options.GetFirstDayOfYear(day);
                    var yearEnd = options.GetLastDayOfYear(day);
                    yearEnd = yearEnd.AddDays(1);
                    if (yearStart < today)
                    {
                        var subscriptionYear = options.GetSubscriptionYear(yearStart);
                        var joiners = index == 0 ? allMembers.Where(m => m.JoinedOn == null || m.JoinedOn < yearEnd)
                            : allMembers.Where(m => m.JoinedOn != null && m.JoinedOn >= yearStart && m.JoinedOn < yearEnd);
                        var leavers = allMembers.Where(m => m.LeftOn != null && m.LeftOn >= yearStart && m.LeftOn < yearEnd);
                        if (subscriptionYear == "2017/18")
                        {
                            var c1 = joiners.SingleOrDefault(x => x.Id == 392);
                            var c2 = leavers.SingleOrDefault(x => x.Id == 392);
                            //Debugger.Break();
                        }

                        (totalMembers, totalAssociates) = GetJoinersAndLeavers(subscriptionYear, totalMembers, totalAssociates, joiners, leavers, out LeaverJoiners lj);
                        leaversAndJoiners.Add(lj);
                        day = day.AddYears(1);
                    }
                    else
                    {
                        finished = true;
                    }
                    index++;
                }
                leaversAndJoiners.Reverse();
                stats.LeaverJoiners = leaversAndJoiners.Take(options.LJAnalysisPeriod).ToArray();
                return SuccessResult(stats);
            }
        }
        [HttpGet("get/history")]
        public IActionResult GetChangeHistory()
        {
            var userProfile = User.GetProfile();
            var changes = db.Changes
                .Include(x => x.Member)
                    .ThenInclude(x => x.Zone)
                .Where(x => x.MadeBy != "System");
            if (userProfile.Type == UserType.StreetRepresentative)
            {
                changes = changes.Where(x => x.Member != null && x.Member.Zone != null && x.Member.Zone.Number == userProfile.ZoneNumber);
            }
            changes = changes
                .OrderByDescending(x => x.Date);
            return SuccessResult(changes.Select(x => x.ToDTO()));
        }
        [HttpGet("get/info/mailchimp")]
        public async Task<IActionResult> GetMailChimpInformation()
        {
            IEnumerable<string> extractEmailAddresses(IEnumerable<Member> members)
            {
                return members.Where(m => m.Email != null && m.Email.Trim() != "")
                .Select(x => x.Email)
                .Union(members.Where(m => m.MemberCount > 1 && m.SecondEmail != null && m.SecondEmail.Trim() != "")
                .Select(x => x.SecondEmail))
                .OrderBy(m => m)
                .Distinct(StringComparer.InvariantCultureIgnoreCase)
                ;
            }
            var info = new MailchimpInformation();
            info.UpdatesEnabled = this.options.MailChimpUpdatesEnabled;
            var t0 = await this.mailchimpService.GetSubscribedMembersAsync();
            info.Subscribed = t0.Select(x => x.ToDTO());// await this.mailchimpService.GetSubscribedMembersAsync();
            var t1 = await this.mailchimpService.GetArchivedMembersAsync();
            info.Archived = t1.Select(x => x.ToDTO());
            var t2 = await this.mailchimpService.GetCleanedMembersAsync();
            info.Cleaned = t2.Select(x => x.ToDTO());
            var t3 = await this.mailchimpService.GetUnsubscribedMembersAsync();
            info.Unsubscribed = t3.Select(x => x.ToDTO());

            IEnumerable<Member> membersWithEmailAddresses = GetMembersWithEmailAddresses();
            var membersThatHaveleft = membersWithEmailAddresses.Where(x => x.HasLeft);
            var remainder = membersWithEmailAddresses.Where(x => !x.HasLeft);
            var suspendedMembers = membersWithEmailAddresses.Where(x => x.HasLeft == false && x.IsSuspended == true); ;// remainder.Where(x => x.IsSuspended);
            var membersReceivingEmail = membersWithEmailAddresses.Where(x => x.HasLeft == false && x.IsSuspended == false && x.MinutesDeliveryMethod == MinutesDeliveryMethod.ByEmail);
            var membersDecliningEmail = membersWithEmailAddresses.Where(x => x.HasLeft == false && x.IsSuspended == false && x.MinutesDeliveryMethod != MinutesDeliveryMethod.ByEmail);// remainder.Where(x => !x.IsSuspended && x.MinutesDeliveryMethod != MinutesDeliveryMethod.ByEmail);

            info.MembersReceivingEmail = extractEmailAddresses(membersReceivingEmail);
            info.MembersDecliningEmail = extractEmailAddresses(membersDecliningEmail);
            info.MembersThatHaveLeft = extractEmailAddresses(membersThatHaveleft);
            info.SuspendedMembers = extractEmailAddresses(suspendedMembers);
            return SuccessResult(info);
        }

        private IEnumerable<Member> GetMembersWithEmailAddresses()
        {
            var membersWithEmailAddresses = db.Members
                .Where(m => 
                    (m.Email != null && m.Email.Trim() != "")  || (m.MemberCount > 1 && m.SecondEmail != null && m.SecondEmail.Trim() != "")
                   )
                .OrderBy(m => m.Email)
                .AsEnumerable();
            return membersWithEmailAddresses;
        }

        [HttpGet("sync/mailchimp")]
        public async Task<IActionResult> SynchWithMailChimp()
        {
            void logResult(MailChimpServiceResult mr)
            {
                switch (mr.Response)
                {
                    case MailChimpServiceResponse.Error:
                        log.Debug($" mr --> {mr.Response}, {mr.Exception.Message}");
                        break;
                    default:
                        log.Trace($" mr --> {mr.Response}");
                        break;
                }
            }
            IEnumerable<string> GetEmailAddresses(Member m)
            {
                switch (m.MemberCount)
                {
                    case 1:
                        if (!string.IsNullOrWhiteSpace(m.Email))
                        {
                            return new string[] { m.Email };
                        }
                        goto default;

                    case 2:
                        var list = new List<string>();
                        if (!string.IsNullOrWhiteSpace(m.Email))
                        {
                            list.Add(m.Email);
                        }
                        if (!string.IsNullOrWhiteSpace(m.SecondEmail))
                        {
                            list.Add(m.SecondEmail);
                        }
                        return list;
                    default:
                        return new string[0];
                }
            }
            if (options.MailChimpEnabled)
            {
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                var membersWithEmailAddresses = this.GetMembersWithEmailAddresses();
                log.Information($"**************************** Sync phase 1 ************************");
                foreach(Member member in membersWithEmailAddresses)
                {
                    log.Debug($"calling AddOrUpdateMemberAsync() with member {member.Id}, ==> {(string.Join(", ", GetEmailAddresses(member)))})");
                    var mrlist = await this.mailchimpService.AddOrUpdateMemberAsync(member);
                    foreach(var mr in mrlist)
                    {
                        logResult(mr);
                    }
                }
                var mailChimpAddresses = await this.mailchimpService.GetAllMemberEmailAddressesAsync();
                log.Information($"**************************** Sync phase 2 ************************");
                foreach (var address in mailChimpAddresses)
                {
                    var m = await db.Members.FirstOrDefaultAsync(x => x.Email.ToLower() == address.ToLower() ||x.MemberCount > 1 &&  x.SecondEmail.ToLower() == address.ToLower());
                    if(m == null)
                    {
                        log.Debug($"calling DeleteMemberAsync() with address {address} as no corresponding member found in db");
                        var mr = await this.mailchimpService.DeleteMemberAsync(address);
                        logResult(mr);
                    }
                }
            }
            else
            {
                log.Warning($"sync/mailchimp requested but mailchimp is not enabled");
            }
            return SuccessResult();
        }
        //
        private IEnumerable<MemberDTO> GetMemberListAsDTO(IEnumerable<ColumnMetadata> filters)
        {

            //traceFilters(filters);
            var members = GetMemberList(filters)
                .Select(m => m.ToDTO(this.options, false, false, false));
            return members;
        }
        private IEnumerable<Member> GetMemberList(IEnumerable<ColumnMetadata> filters)
        {
            //traceFilters(filters);
            var userProfile = User.GetProfile();
            IEnumerable<Member> members = db.Members
                .Include(x => x.Payments)
                .Include(x => x.Zone)
                .OrderBy(m => m.LastName)
                .ThenBy(m => m.FirstName)
                //.ToArray().AsQueryable()
                ;
            if (userProfile.Type == UserType.StreetRepresentative)
            {
                members = members.Where(x => x.Zone.Number == userProfile.ZoneNumber);
            }
            members = members.AsEnumerable()
                .Where(m => m.Filter(options, filters));
            return members;
        }
        private bool IfAssociate(Member m)
        {
            return m.IsAssociate;
        }
        private (int totalMembers, int totalAssociates) GetJoinersAndLeavers(string subscriptionYear, int totalMembers, int totalAssociates,
            IEnumerable<Member> joiners, IEnumerable<Member> leavers, out LeaverJoiners lj)
        {
            var joined = joiners.Sum(m => m.MemberCount);
            var left = leavers.Sum(m => m.MemberCount);
            totalMembers += joined - left;
            //var associatesJoined = joiners.Where(m => m.IsAssociate).Sum(m => m.MemberCount);
            //var associatesleft = leavers.Where(m => m.IsAssociate).Sum(m => m.MemberCount);
            var associatesJoined = joiners.Where(m => IfAssociate(m)).Sum(m => m.MemberCount);
            var associatesleft = leavers.Where(m => IfAssociate(m)).Sum(m => m.MemberCount);
            totalAssociates += associatesJoined - associatesleft;
            log.Trace($"{subscriptionYear}, joined {joined}, left {left}, associates: joined {associatesJoined}, left {associatesleft}");

            lj = new LeaverJoiners
            {
                YearName = subscriptionYear,
                TotalJoiners = joined,
                TotalLeavers = left,
                TotalMembers = totalMembers,
                TotalAssociateMembers = totalAssociates,
                TotalAssociateJoiners = associatesJoined,// joiners.Where(m => m.IsAssociate).Sum(m => m.MemberCount),
                TotalAssociateLeavers = associatesleft,// leavers.Where(m => m.IsAssociate).Sum(m => m.MemberCount),
                TotalDeathsIllness = leavers.Where(m => m.LeavingReason == LeavingReasons.DeathOrIllness).Sum(m => m.MemberCount),
                TotalMoved = leavers.Where(m => m.LeavingReason == LeavingReasons.MovedAway).Sum(m => m.MemberCount),
                TotalWorkCommitments = leavers.Where(m => m.LeavingReason == LeavingReasons.WorkCommitments).Sum(m => m.MemberCount),
                TotalOtherReasons = leavers.Where(m => m.LeavingReason == LeavingReasons.Other).Sum(m => m.MemberCount),
            };
            //log.Trace($"{lj.YearName}, {lj.TotalMembers} ({lj.TotalAssociateMembers}) joined {lj.TotalJoiners}, left {lj.TotalLeavers}  associates joined {lj.TotalAssociateJoiners}, associates left {lj.TotalAssociateLeavers}");
            return (totalMembers, totalAssociates);
        }
        private void traceFilters(IEnumerable<ColumnMetadata> filters)
        {
            foreach (var f in filters)
            {
                log.Trace(f.ToString());
            }
        }
    }
}