using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public class QParaOptions
    {
        public string SiteUrl { get; set; }
        public string FirstMonthOfYear { get; set; }
        public string QPInitialCatalog { get; set; }
        public string MemberSource { get; set; }
        public string Membersheet { get; set; }
        public int StartRow { get; set; }
        public int FinishRow { get; set; }
        public int AuthenticationIdleTimeout { get; set; } // in minutes
        public bool ShowEmailAsMailToLink { get; set; }
        public int SubscriptionYearFrom { get; set; }
        public int SubscriptionYearTo { get; set; }
        public int LJAnalysisPeriod { get; set; } // no of years
        public DocumentInfo[] DocumentList { get; set; }
        public bool TimestampDownloadFilenames { get; set; }
        public bool MailChimpEnabled { get; set; } = false;
        public bool MailChimpUpdatesEnabled { get; set; } = false;
        public bool MailChimpAllowUnsubscribedToBeDeleted { get; set; } = true;
        public bool UseQparaMailChimpKeyInTesting  { get; set; } = false;
        public QParaOptions()
        {
            DocumentList = new DocumentInfo[0];
            AuthenticationIdleTimeout = 1;
        }
    }
}
