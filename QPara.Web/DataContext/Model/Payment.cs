using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Fastnet.QPara.Data
{
    public class Payment
    {
        public int Id { get; set; }
        [MaxLength(8)]
        public string SubscriptionYear { get; set; } // in the form 2017/18
        // *NB* retain DueDate filed until version 3 because
        // it is used during conversion to Version 2 to obtain
        // the Subscription Year
        [Obsolete]
        public DateTimeOffset DueDate { get; set; }
        public DateTimeOffset? ReceivedDate { get; set; }
        public int AmountReceived { get; set; }
        public PaymentType Type { get; set; }
        public bool IsPaid { get; set; }
        public int MemberId { get; set; }
        public virtual Member Member { get; set; }
        public virtual ICollection<PaymentNote> PaymentNotes { get; } = new HashSet<PaymentNote>();
        [Timestamp]
        public byte[] TimeStamp { get; set; }
    }
}
