namespace Fastnet.QPara.Data
{
    public class PaymentNote
    {
        public int PaymentId { get; set; }
        public int NoteId { get; set; }
        public virtual Payment Payment { get; set; }
        public virtual Note Note { get; set; }
    }
}
