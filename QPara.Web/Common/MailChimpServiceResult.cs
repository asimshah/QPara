using System;
using mc_model = MailChimp.Net.Models;

namespace QPara.Web
{
    public class MailChimpServiceResult
    {
        public MailChimpServiceResponse Response { get; set; }
        public mc_model.Member Contact { get; set; }
        public Exception Exception { get; set; }
    }
}
