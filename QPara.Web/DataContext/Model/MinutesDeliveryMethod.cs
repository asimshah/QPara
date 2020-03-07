using System.ComponentModel;

namespace Fastnet.QPara.Data
{
    public enum MinutesDeliveryMethod
    {
        [Description("Email")]
        ByEmail,
        [Description("Hand")]
        ByHand,
        [Description("Not Required")]
        NotRequired
    }
}
