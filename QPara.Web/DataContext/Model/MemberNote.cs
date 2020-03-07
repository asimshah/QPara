namespace Fastnet.QPara.Data
{
    public class MemberNote
    {
        public int MemberId { get; set; }
        public int NoteId { get; set; }
        public virtual Member Member { get; set; }
        public virtual Note Note { get; set; }
    }
}
