using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using System;
using MailChimp.Net;
using Microsoft.Extensions.Hosting;

namespace Fastnet.QPara
{
    public class DocumentInfo
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string FullPath { get; set; }
        public string MimeType { get; set; }
    }
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
        public bool UseQparaMailChimpKeyInTesting { get; set; } = false;
        public string QParaMailchimpKey { get; set; }
        public string TestMailchimpKey { get; set; }
        public QParaOptions()
        {
            DocumentList = new DocumentInfo[0];
            AuthenticationIdleTimeout = 1;
        }
    }
    public class Mailchimp
    {
        private const string key = Fastnet.Core.ApplicationKeys.QPara;
        public static MailChimpManager GetManager(IServiceProvider sp)
        {
            var options = sp.GetService<IOptionsMonitor<QParaOptions>>();
            IHostEnvironment env = sp.GetService<IWebHostEnvironment>();
            var testKey = a.a(options.CurrentValue.TestMailchimpKey, key);
            var qparaKey = a.a(options.CurrentValue.QParaMailchimpKey, key);
            string mailChimpApiKey;
            if (env.IsDevelopment() && options.CurrentValue.UseQparaMailChimpKeyInTesting == false)
            {
                // this is my mailchimp api key 
                mailChimpApiKey = testKey;
            }
            else
            {
                mailChimpApiKey = qparaKey;
            }
            return new MailChimpManager(mailChimpApiKey);
        }
    }
}
