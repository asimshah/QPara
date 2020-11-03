using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QPara.Web;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public class SynchroniseWithMailchimp : SinglePipelineTask
    {
        private QParaDb db;
        private readonly QParaOptions options;
        private readonly string connectionString;
        public SynchroniseWithMailchimp(ILoggerFactory loggerFactory, IOptions<QParaOptions> qpOptions,
            IConfiguration cfg, IWebHostEnvironment environment
            ) : base(loggerFactory)
        {
            this.options = qpOptions.Value;
            connectionString = environment.LocaliseConnectionString(cfg.GetConnectionString("QParaDb"));
        }

        protected async override Task<ITaskState> DoTask(ITaskState taskState, ScheduleMode mode, CancellationToken cancellationToken, params object[] args)
        {
            log.Information("started");
            using (db = new QParaDb(connectionString))
            {
                void logResult(MailChimpServiceResult mr)
                {
                    switch (mr.Response)
                    {
                        case MailChimpServiceResponse.Error:
                            log.Debug($" mr --> {mr.Response}, {mr.Exception.Message}");
                            break;
                        default:
                            log.Trace($" mr --> {mr.Response}");
                            break;
                    }
                }
                IEnumerable<string> GetEmailAddresses(Member m)
                {
                    switch (m.MemberCount)
                    {
                        case 1:
                            if (!string.IsNullOrWhiteSpace(m.Email))
                            {
                                return new string[] { m.Email };
                            }
                            goto default;

                        case 2:
                            var list = new List<string>();
                            if (!string.IsNullOrWhiteSpace(m.Email))
                            {
                                list.Add(m.Email);
                            }
                            if (!string.IsNullOrWhiteSpace(m.SecondEmail))
                            {
                                list.Add(m.SecondEmail);
                            }
                            return list;
                        default:
                            return new string[0];
                    }
                }
                if (options.MailChimpEnabled)
                {
                    db.ChangeTracker.AutoDetectChangesEnabled = false;
                    var membersWithEmailAddresses = this.GetMembersWithEmailAddresses();
                    log.Information($"**************************** Sync phase 1 ************************");
                    foreach (Member member in membersWithEmailAddresses)
                    {
                        log.Debug($"calling AddOrUpdateMemberAsync() with member {member.Id}, ==> {(string.Join(", ", GetEmailAddresses(member)))})");
                        var mrlist = await this.mailchimpService.AddOrUpdateMemberAsync(member);
                        foreach (var mr in mrlist)
                        {
                            logResult(mr);
                        }
                    }
                    var mailChimpAddresses = await this.mailchimpService.GetAllMemberEmailAddressesAsync();
                    log.Information($"**************************** Sync phase 2 ************************");
                    foreach (var address in mailChimpAddresses)
                    {
                        var m = await db.Members.FirstOrDefaultAsync(x => x.Email.ToLower() == address.ToLower() || x.MemberCount > 1 && x.SecondEmail.ToLower() == address.ToLower());
                        if (m == null)
                        {
                            log.Debug($"calling DeleteMemberAsync() with address {address} as no corresponding member found in db");
                            var mr = await this.mailchimpService.DeleteMemberAsync(address);
                            logResult(mr);
                        }
                    }
                }
                else
                {
                    log.Warning($"sync/mailchimp requested but mailchimp is not enabled");
                }
            }
            return null;
        }
    }
}
