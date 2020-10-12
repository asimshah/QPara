using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.QPara.Data
{
    public enum MemberType // only used in stats
    {
        FullMember,
        Associate
    }
    public enum LeavingReasons
    {
        Other,
        MovedAway,
        DeathOrIllness,
        WorkCommitments
    }
    public class Member
    {
        public int Id { get; set; }
        public int Number { get; set; }
        [MaxLength(8)]
        public string Title { get; set; }
        [MaxLength(128)]
        public string FirstName { get; set; }
        [MaxLength(128)]
        public string LastName { get; set; }
        [MaxLength(256)]
        public string Email { get; set; }
        [MaxLength(256)]
        public string SecondEmail { get; set; }
        [MaxLength(64)]
        public string PhoneNumber { get; set; }
        [MaxLength(64)]
        public string MobileNumber { get; set; }
        [MaxLength(4096)]
        public string Address { get; set; }
        [MaxLength(128)]
        public string Flat { get; set; }
        [MaxLength(32)]
        public string PostCode { get; set; }
        public bool IsAssociate { get; set; }
        public SubscriptionType SubscriptionType { get; set; }
        public SubscriptionPeriod SubscriptionPeriod { get; set; }
        public DateTimeOffset? JoinedOn { get; set; }
        public DateTimeOffset? LeftOn { get; set; }
        public LeavingReasons LeavingReason { get; set; }
        public bool IsSuspended { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int MemberCount { get; set; }
        public MinutesDeliveryMethod MinutesDeliveryMethod { get; set; }
        public string DeliveryNote { get; set; }
        public int ZoneNumber { get; set; }
        public int? ZoneId { get; set; }
        public virtual Zone Zone { get; set; }
        public int MonthDue { get; set; } // calendar month number 1 = jan
        public bool PaymentIsOutstanding { get; set; }
        public int AmountDue { get; set; }
        public int AmountReceived { get; set; }

        public virtual ICollection<Payment> Payments { get; } = new HashSet<Payment>();
        public virtual ICollection<MemberNote> MemberNotes { get; } = new HashSet<MemberNote>();
        public virtual ICollection<Change> Changes { get; } = new HashSet<Change>();
        [Timestamp]
        public byte[] TimeStamp { get; set; }
        [NotMapped]
        public string Name
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(FirstName) && !string.IsNullOrWhiteSpace(LastName))
                {
                    return $"{FirstName.Trim()} {LastName.Trim()}";
                }
                else if (!string.IsNullOrWhiteSpace(FirstName))
                {
                    return FirstName.Trim();
                }
                return LastName.Trim();
            }
        }

        [NotMapped]
        public string FullAddress
        {
            get
            {
                return BuildFullAddress();
            }
        }
        [NotMapped]
        public bool Expired
        {
            get
            {
                return LeftOn.HasValue;
            }
        }
        [NotMapped]
        public bool HasLeft
        {
            get
            {
                return LeftOn.HasValue;
            }
        }
        public string BuildFullAddress()
        {
            StringBuilder sb = new StringBuilder();
            if (!string.IsNullOrWhiteSpace(Flat))
            {
                sb.AppendLine(Flat);
            }
            if (!string.IsNullOrWhiteSpace(Address))
            {
                string[] parts = Address.Split("\n");
                foreach (var part in parts)
                {
                    if (!string.IsNullOrWhiteSpace(part))
                    {
                        sb.AppendLine(part);
                    }
                } 
            }
            //if (!string.IsNullOrWhiteSpace(PostCode))
            //{
            //    sb.AppendLine(PostCode);
            //}
            return sb.ToString();
        }
        public int GetSubscriptionRate()
        {
            int result = 0;
            switch (SubscriptionType)
            {
                default:
                    break;
                case SubscriptionType.Unknown:
                case SubscriptionType.Standard:
                    result = PaymentMethod == PaymentMethod.Regular ? 8 : 10;
                    break;
                case SubscriptionType.Concession:
                    result = PaymentMethod == PaymentMethod.Regular ? 4 : 5;
                    break;
            }
            if (MemberCount > 1)
            {
                result *= MemberCount;
            }
            return result;
        }
        public bool GetIsPaid(QParaOptions options)
        {
            return this.Payments.Where(x => x.SubscriptionYear == options.GetCurrentSubscriptionYear())
                .Any(x => x.IsPaid);
        }

    }
}
