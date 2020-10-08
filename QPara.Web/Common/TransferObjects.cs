using Fastnet.Core;
using Fastnet.QPara.Data;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using mc_model = MailChimp.Net.Models;

namespace Fastnet.QPara
{
    public class LeaverJoiners
    {
        public string YearName { get; set; }
        public int TotalMembers { get; set; }
        public int TotalJoiners { get; set; }
        public int TotalLeavers { get; set; }
        public int TotalAssociateMembers { get; set; }
        public int TotalAssociateJoiners { get; set; }
        public int TotalAssociateLeavers { get; set; }
        public int TotalMoved { get; set; }
        public int TotalDeathsIllness { get; set; }
        public int TotalWorkCommitments { get; set; }
        public int TotalOtherReasons { get; set; }
    }
    public class MembershipCounts
    {
        public SubscriptionPeriodCounts FullMembers { get; set; }
        public SubscriptionPeriodCounts Associates { get; set; }
        public MembershipCounts()
        {
            FullMembers = new SubscriptionPeriodCounts();
            Associates = new SubscriptionPeriodCounts();
        }
    }
    public class SubscriptionPeriodCounts
    {
        public SubscriptionTypeCounts Annual { get; set; }
        public SubscriptionTypeCounts Life { get; set; }
        public SubscriptionPeriodCounts()
        {
            Annual = new SubscriptionTypeCounts();
            Life = new SubscriptionTypeCounts();
        }
    }
    public class SubscriptionTypeCounts
    {
        public int Standard { get; set; }
        public int Concession { get; set; }
        public int Complimentary { get; set; }
        public int Total { get { return Standard + Concession + Complimentary; } set { } }
    }
    public class Statistics
    {
        public MembershipCounts Counts { get; set; } // d1 = MemberType, d2 = SubscriptionPeriod, d3 = SubscritopnType
        public List<string> Messages { get; set; }
        public LeaverJoiners[] LeaverJoiners { get; set; }
        public Statistics()
        {
            Counts = new MembershipCounts();
            //LeaverJoiners = new LeaverJoiners();
        }
    }
    public class QueryResult
    {
        public string CreatedOn { get; set; }
    }
    public class MemberList : QueryResult
    {
        public Member[] Members { get; set; }
    }
    public class NewPaymentNoteDTO
    {
        public int PaymentId { get; set; }
        public NoteDTO Note { get; set; }
    }
    //public class MemberUpdateDetails
    //{
    //    public Member Member { get; set; }
    //    public NoteDTO NewNote { get; set; }
    //    public Payment[] NewPayments { get; set; }
    //    public NewPaymentNoteDTO[] NewPaymentNotes { get; set; }
    //}
    public class StreetRepList
    {
        public Member StreetRep { get; set; }
        public Member[] Members { get; set; }
        public string BccAddresses { get; set; }
    }
    //public class MemberWithPayment
    //{
    //    public Member Member { get; set; }
    //    public MemberPaymentInfo PaymentInfo { get; set; }
    //}
    //[Obsolete]
    //public class OutstandingPaymentInfo
    //{
    //    public MemberPaymentInfo[] PaymentInfoList { get; set; }
    //    public string BccAddresses { get; set; }
    //}
    //public class MemberWithPaymentList
    //{
    //    public MemberWithPayment[] MemberWithPaymentCollection { get; set; }
    //    public string BccAddresses { get; set; }
    //}
    //[Obsolete]
    //public class MemberPaymentInfo
    //{
    //    public int MemberId { get; set; }
    //    public bool PaymentIsOutstanding { get; set; }
    //    public DateTimeOffset DueOn { get; set; }
    //    public int AmountDue { get; set; }
    //    public int AmountReceived { get; set; }
    //}
    //
    //
    //
    public class ChangeDTO
    {
        public string DateTime { get; set; }
        public string MadeBy { get; set; }
        public string Description { get; set; }
        public string MemberName { get; set; }
        public int ZoneNumber { get; set; }
    }
    public class NoteLineDTO
    {
        public int Index { get; set; }
        public string Line { get; set; }
    }
    public class NoteDTO
    {
        public int Id { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public string FormattedCreatedOn { get; set; }
        public string UserName { get; set; }
        public IEnumerable<NoteLineDTO> NoteLines { get; set; }
    }
    public class MemberDTO
    {
        public int Id { get; set; }
        //public string Title { get; set; }
        public string Name { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string SecondEmail { get; set; }
        public bool HasEmail { get; set; }
        public string PhoneNumber { get; set; }
        public string MobileNumber { get; set; }
        public string Flat { get; set; }
        public string Address { get; set; }
        public string PostCode { get; set; }
        public int ZoneNumber { get; set; }
        public int MemberCount { get; set; }
        public bool IsAssociate { get; set; }
        public SubscriptionPeriod SubscriptionPeriod { get; set; }
        public SubscriptionType SubscriptionType { get; set; }
        public DateTimeOffset? JoinedOn { get; set; }
        public DateTimeOffset? LeftOn { get; set; }
        public LeavingReasons LeavingReason { get; set; }
        public bool IsSuspended { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        //public DateTimeOffset? EarliestPaymentDate { get; set; }
        public IEnumerable<PaymentDTO> Payments { get; set; }
        public MinutesDeliveryMethod MinutesDeliveryMethod { get; set; }
        public string DeliveryNote { get; set; }
        public int MonthDue { get; set; }
        public bool PaymentIsOutstanding { get; set; }
        //public DateTimeOffset DueOn { get; set; }
        public int AmountDue { get; set; }
        public int AmountReceived { get; set; }
        public bool IsPaid { get; set; } // this does not exist in the database model but is computed during DTO creation
        public bool HasLeft { get; set; }
        public IEnumerable<NoteDTO> Notes { get; set; }
        public IEnumerable<ChangeDTO> Changes { get; set; }
    }
    public class PaymentDTO
    {
        public int Id { get; set; }
        public string SubscriptionYear { get; set; }
        //public DateTimeOffset DueDate { get; set; }
        //public int AmountDue { get; set; }
        public DateTimeOffset? ReceivedDate { get; set; }
        public int AmountReceived { get; set; }
        public PaymentType Type { get; set; }
        public bool IsPaid { get; set; }
        public IEnumerable<NoteDTO> Notes { get; set; }
    }
    public class ZoneDTO
    {
        public long Id { get; set; }
        public int Number { get; set; }
        public string Description { get; set; }
        public long StreetRepId { get; set; }
        public string StreetrepDescription { get; set; }
    }
    public class SubscriptionYearsDTO
    {
        public List<string> SubscriptionYears { get; set; }
        public string CurrentSubscriptionYear { get; set; }
    }
    public class Parameters
    {
        public string[] SubscriptionYears { get; set; }
        public Zone[] Zones { get; set; }
        public bool ShowEmailAsMailToLink { get; set; }
        public string CurrentSubscriptionYear { get; internal set; }
    }
    public class EmailAddresses
    {
        public string[] AddressesForMembers { get; set; }
        public string[] AddressesForMinutes { get; set; }
        public string[] AddressesForPaymentsOutstanding { get; set; }
    }
    public class MailchimpContact
    {
        public string EmailAddress { get; set; }
        public string UnsubscribeReason { get; set; }
    }
    public class MailchimpInformation
    {
        public bool UpdatesEnabled { get; set; }
        public IEnumerable<MailchimpContact> Subscribed { get; set; }
        public IEnumerable<MailchimpContact> Archived { get; set; }
        public IEnumerable<MailchimpContact> Unsubscribed { get; set; }
        public IEnumerable<MailchimpContact> Cleaned { get; set; }
        public IEnumerable<string> MembersReceivingEmail { get; set; }
        public IEnumerable<string> MembersDecliningEmail { get; set; }
        public IEnumerable<string> MembersThatHaveLeft { get; set; }
        public IEnumerable<string> SuspendedMembers { get; set; }
    }
    public static partial class dtoExtensions
    {
        private static DateTimeOffset backDate = new DateTimeOffset(2017, 10, 1, 0, 0, 0, 0, TimeSpan.Zero);
        public static ChangeDTO ToDTO(this Change c)
        {
            try
            {
                var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
                return new ChangeDTO
                {
                    DateTime = TimeZoneInfo.ConvertTime(c.Date, ukTime).ToDefaultWithTime(),
                    MadeBy = c.MadeBy,
                    Description = c.Description,
                    MemberName = c.Member?.Name ?? "",
                    ZoneNumber = c.Member?.Zone?.Number ?? 0
                };
            }
            catch (Exception xe)
            {
                Debugger.Break();
                throw;
            }
        }
        public static NoteDTO ToDTO(this Note n)
        {
            return new NoteDTO
            {
                Id = n.Id,
                CreatedOn = n.CreatedOn,                
                FormattedCreatedOn = n.CreatedOn < backDate ? "" : n.CreatedOn.ToString("ddMMMyy"),
                UserName = n.UserName,
                NoteLines = n.NoteLines
                    .OrderBy(nl => nl.Index)
                    .Select(x => x.ToDTO())
            };
        }
        public static NoteLineDTO ToDTO(this NoteLine nl)
        {
            return new NoteLineDTO
            {
                Index = nl.Index,
                Line = nl.Line
            };
        }
        public static string[] GetEmailAddresses(this Member m)
        {
            var list = new List<string>();
            if (!string.IsNullOrWhiteSpace(m.Email))
            {
                list.Add(m.Email);

            }
            if (!string.IsNullOrWhiteSpace(m.SecondEmail))
            {
                list.Add(m.SecondEmail);
            }
            return list.ToArray();
        }
        public static IEnumerable<Member> OrderByStreetAddress(this IEnumerable<Member> members)
        {
            var list = new List<(string fp, string np, string rp, Member m)>();
            foreach (var m in members)
            {
                var numberPart = "99";
                var roadPart = "zzzzzz";
                var flatPart = m.Flat ?? "zz";
                if (!string.IsNullOrWhiteSpace(m.Address))
                {
                    var firstline = m.Address.Trim().Replace("  ", " ").Split("\n")[0];
                    var parts = firstline.Split(" ");

                    if (parts.Length > 1)
                    {
                        numberPart = parts[0];
                        roadPart = parts[1];
                        var match = Regex.Match(numberPart, @"^\d+");
                        if (match.Success)
                        {
                            numberPart = Convert.ToInt32(match.Value).ToString("000");
                        }
                    }
                }
                (string fp, string np, string rp, Member m) key = (flatPart, numberPart, roadPart, m);

                list.Add(key);
            }
            return list.OrderBy(x => x.rp)
                .ThenBy(x => x.np)
                .ThenBy(x => x.fp)
                .Select(x => x.m)
                .ToArray();
        }
        public static bool Filter(this Member m, QParaOptions options, IEnumerable<ColumnMetadata> filter)
        {
            try
            {
                var r = true;
                foreach (var cd in filter.Where(x => x.Filter != null && x.Filter.Enabled))
                {
                    switch (cd.Name)
                    {
                        case Names.ZoneNumber:
                            //r = (cd.Filter as NumberFilter).Match(m.ZoneNumber);
                            var val = new EnumValue { Value = m.ZoneNumber, Name = m.Zone.Description };
                            r = (cd.Filter as ZoneFilter).Match(val);
                            break;
                        case Names.JoinedOn:
                            if (m.JoinedOn == null)
                            {
                                // member has no joined on t so cannot be included in a joined on date filter
                                r = false;
                            }
                            else
                            {
                                r = (cd.Filter as DateFilter).Match(m.JoinedOn.Value);
                            }
                            break;
                        case Names.SubscriptionType:
                            r = (cd.Filter as SubscriptionTypeFilter).Match(m.SubscriptionType);
                            break;
                        case Names.SubscriptionPeriod:
                            r = (cd.Filter as SubscriptionPeriodFilter).Match(m.SubscriptionPeriod);
                            break;
                        case Names.PaymentMethod:
                            r = (cd.Filter as PaymentMethodFilter).Match(m.PaymentMethod);
                            break;
                        case Names.MinutesDeliveryMethod:
                            r = (cd.Filter as MinutesDeliveryMethodFilter).Match(m.MinutesDeliveryMethod);
                            break;
                        case Names.IsSuspended:
                            r = (cd.Filter as BoolFilter).Match(m.IsSuspended);
                            break;
                        case Names.HasLeft:
                            r = (cd.Filter as BoolFilter).Match(m.HasLeft);
                            break;
                        case Names.LeftOn:
                            // true means member passes the filter and is retained
                            if (m.LeftOn == null)
                            {
                                // member has not left so cannot be included in a left on date filter
                                r = false;
                            }
                            else
                            {
                                r = (cd.Filter as DateFilter).Match(m.LeftOn.Value);
                            }
                            break;
                        case Names.PaymentIsOutstanding:
                            r = (cd.Filter as BoolFilter).Match(m.PaymentIsOutstanding) && !(cd.Filter as BoolFilter).Match(m.GetIsPaid(options));

                            break;
                        case Names.IsPaid:
                            //r = (cd.Filter as BoolFilter).Match(m.IsPaid);
                            r = (cd.Filter as BoolFilter).Match(m.GetIsPaid(options));
                            break;
                        case Names.MemberCount:
                            r = (cd.Filter as NumberFilter).Match(m.MemberCount);
                            break;
                    }
                    if (r == false)
                    {
                        break;
                    }
                }
                return r;
            }
            catch (Exception xe)
            {
                Debugger.Break();
                throw;
            }
        }
        public static MemberDTO ToDTO(this Member m, QParaOptions options,
            bool includePayments,
            bool includeNotes,
            bool includeChanges
            )
        {
            //var ps = GetPaymentStatus(m, options);
            return new MemberDTO
            {
                Id = m.Id,
                //Title = m.Title,
                Name = m.Name,
                FirstName = m.FirstName,
                LastName = m.LastName,
                Email = m.Email ?? string.Empty,
                SecondEmail = m.SecondEmail ?? string.Empty,
                HasEmail = !string.IsNullOrWhiteSpace(m.Email)  || !string.IsNullOrWhiteSpace(m.SecondEmail),
                PhoneNumber = m.PhoneNumber ?? string.Empty,
                MobileNumber = m.MobileNumber ?? string.Empty,
                Flat = m.Flat ?? string.Empty,
                Address = m.Address ?? string.Empty,
                PostCode = m.PostCode ?? string.Empty,
                ZoneNumber = m.ZoneNumber,
                MemberCount = m.MemberCount,
                IsAssociate = m.IsAssociate,
                SubscriptionPeriod = m.SubscriptionPeriod,
                SubscriptionType = m.SubscriptionType,
                JoinedOn = m.JoinedOn,
                LeftOn = m.LeftOn,
                LeavingReason = m.LeavingReason,
                IsSuspended = m.IsSuspended,
                PaymentMethod = m.PaymentMethod,
                Payments = m.Payments?
                    .OrderByDescending(p => p.SubscriptionYear)
                    .ThenByDescending(p => p.ReceivedDate)
                    .Select(p => p.ToDTO(includeNotes)),
                //EarliestPaymentDate = m.Payments.OrderBy(p => p.DueDate).Select(x => x.DueDate).FirstOrDefault(),
                MinutesDeliveryMethod = m.MinutesDeliveryMethod,
                DeliveryNote = m.DeliveryNote,
                PaymentIsOutstanding = m.PaymentIsOutstanding,// ps.paymentOutstanding,
                AmountDue = m.AmountDue,// ps.amountDue,
                AmountReceived = m.AmountReceived,// ps.amountReceived,
                IsPaid = m.GetIsPaid(options),// m.IsPaid,
                MonthDue = m.MonthDue,
                HasLeft = m.HasLeft,
                Notes = includeNotes ? m.MemberNotes
                    .Select(x => x.Note.ToDTO()).OrderByDescending(x => x.CreatedOn) : null,
                Changes = m.Changes?.OrderByDescending(c => c.Date).Select(c => c.ToDTO())
            };
        }
        public static PaymentDTO ToDTO(this Payment p, bool includeNotes)
        {
            return new PaymentDTO
            {
                Id = p.Id,
                SubscriptionYear = p.SubscriptionYear,
                //DueDate = p.DueDate,
                //AmountDue = p.AmountDue,
                ReceivedDate = p.ReceivedDate,
                AmountReceived = p.AmountReceived,
                Type = p.Type,
                IsPaid = p.IsPaid,
                Notes = includeNotes ? p.PaymentNotes
                    .Select(x => x.Note.ToDTO()).OrderByDescending(x => x.CreatedOn) : null
            };
        }
        public static ZoneDTO ToDTO(this Zone z)
        {
            return new ZoneDTO
            {
                Id = z.Id,
                Number = z.Number,
                Description = z.Description,
                StreetRepId = z.StreetRepId ?? 0,
                StreetrepDescription = z.StreetRepDescription
            };
        }
        public static MailchimpContact ToDTO(this mc_model.Member member)
        {
            return new MailchimpContact
            {
                EmailAddress = member.EmailAddress,
                UnsubscribeReason = member.UnsubscribeReason
            };
        }
    }
}
