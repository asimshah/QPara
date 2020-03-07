using System;
using System.ComponentModel.DataAnnotations;

namespace Fastnet.QPara.Data
{
    public class Change
    {
        public int Id { get; set; }
        public DateTimeOffset Date { get; set; }
        [MaxLength(256)]
        public string MadeBy { get; set; }
        [MaxLength(1024)]
        public string Description { get; set; }
        public int? MemberId { get; set; }
        public virtual Member Member { get; set; }
    }
}
