using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Fastnet.QPara.Data
{

    public class Note
    {
        public int Id { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        [MaxLength(128)]
        public string UserName { get; set; }
        public virtual ICollection<NoteLine> NoteLines { get; } = new HashSet<NoteLine>();
        [JsonIgnore]
        public virtual ICollection<PaymentNote> PaymentNotes { get; set; }
        [JsonIgnore]
        public virtual ICollection<MemberNote> MemberNotes { get; set; }
        [Timestamp]
        public byte[] TimeStamp { get; set; }
    }
    public class NoteLine
    {
        public int Id { get; set; }
        public int Index { get; set; }
        [MaxLength(512)]
        public string Line { get; set; }

        public int NoteId { get; set; }
        public virtual Note Note { get; set; }
    }
}
