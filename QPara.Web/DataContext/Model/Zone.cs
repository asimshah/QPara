using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fastnet.QPara.Data
{
    public class Zone
    {
        [NotMapped]
        private string descr;
        //[Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        public int Number { get; set; }
        [MaxLength(2048)]
        public string Description { get; set; }
        public int? StreetRepId { get; set; }
        [ForeignKey("StreetRepId")]
        public virtual Member StreetRep { get; set; }
        public virtual ICollection<Member> Members { get; set; }
        [Timestamp]
        public byte[] TimeStamp { get; set; }
        [NotMapped]
        public string StreetRepDescription
        {
            get
            {
                if (descr == null && this.StreetRep != null)
                {
                    List<string> list = new List<string>();
                    list.Add(this.StreetRep.Name);
                    if (!string.IsNullOrWhiteSpace(this.StreetRep.Email))
                    {
                        list.Add(this.StreetRep.Email);
                    }
                    if (!string.IsNullOrWhiteSpace(this.StreetRep.Address))
                    {
                        list.Add(this.StreetRep.Address);
                    }
                    if (!string.IsNullOrWhiteSpace(this.StreetRep.MobileNumber))
                    {
                        list.Add(this.StreetRep.MobileNumber);
                    }
                    if (!string.IsNullOrWhiteSpace(this.StreetRep.PhoneNumber))
                    {
                        list.Add(this.StreetRep.PhoneNumber);
                    }
                    descr = string.Join(", ", list.ToArray());
                }
                return descr;
            }
        }
    }
}
