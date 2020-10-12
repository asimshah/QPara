using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.QPara;
using Fastnet.QPara.Data;
using MailChimp.Net;
using MailChimp.Net.Core;
using MailChimp.Net.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using mc_model = MailChimp.Net.Models;

namespace QPara.Web
{
    public class MailChimpService
    {
        private string listId = string.Empty;
        private string mailChimpApiKey = string.Empty;
        private IMailChimpManager mailChimpManager;
        private readonly ILogger log;
        private readonly IOptionsMonitor<QParaOptions> optionsMonitor;
        private readonly string connectionString;
        public MailChimpService(IOptionsMonitor<QParaOptions> optionsMonitor, ILogger<MailChimpService> logger,
            IServiceProvider sp, IConfiguration cfg, IWebHostEnvironment env)
        {
            void Initialise()
            {
                this.mailChimpManager = Mailchimp.GetManager(sp); //new MailChimpManager(mailChimpApiKey);
                IEnumerable<mc_model.List> lists = mailChimpManager.Lists.GetAllAsync().Result;
                if (lists.Count() > 1)
                {
                    log.Warning($"More than one Mailchimp list found");
                }
                var list = lists.First();
                listId = list.Id;
                log.Information($"List {listId}, {list.Name} selected");
            }
            connectionString = env.LocaliseConnectionString(cfg.GetConnectionString("QParaDb"));
            this.optionsMonitor = optionsMonitor;
            this.optionsMonitor.OnChangeWithDelay(opt =>
            {
                Initialise();
            });
            this.log = logger;
            Initialise();
        }
        public async Task<IEnumerable<mc_model.Member>> GetArchivedMembersAsync()
        {
            return await GetMembersAsync(mc_model.Status.Archived);
            //var memberList = await mailChimpManager.Members.GetAllAsync(listId, new MemberRequest
            //{
            //    Status = mc_model.Status.Archived
            //});
            //return memberList.OrderBy(x => x.EmailAddress);
        }
        public async Task<IEnumerable<mc_model.Member>> GetCleanedMembersAsync()
        {
            return await GetMembersAsync(mc_model.Status.Cleaned);
            //var memberList = await mailChimpManager.Members.GetAllAsync(listId, new MemberRequest
            //{
            //    Status = mc_model.Status.Cleaned
            //});
            //return memberList.OrderBy(x => x.EmailAddress);
        }
        public async Task<IEnumerable<mc_model.Member>> GetUnsubscribedMembersAsync()
        {
            return await GetMembersAsync(mc_model.Status.Unsubscribed);
            //var memberList = await mailChimpManager.Members.GetAllAsync(listId, new MemberRequest
            //{
            //    Status = mc_model.Status.Unsubscribed
            //});
            //return memberList.OrderBy(x => x.EmailAddress);
        }
        public async Task<IEnumerable<mc_model.Member>> GetSubscribedMembersAsync()
        {
            return await GetMembersAsync(mc_model.Status.Subscribed);
            //var memberList = await mailChimpManager.Members.GetAllAsync(listId, new MemberRequest
            //{
            //    Status = mc_model.Status.Unsubscribed
            //});
            //return memberList.OrderBy(x => x.EmailAddress);
        }
        public async Task<IEnumerable<mc_model.Member>> GetAllMembersAsync()
        {
            var memberList = await mailChimpManager.Members.GetAllAsync(listId);
            return memberList;
        }
        public async Task<IEnumerable<string>> GetAllMemberEmailAddressesAsync()
        {
            var memberList = await mailChimpManager.Members.GetAllAsync(listId);
            return memberList.Select(m => m.EmailAddress).OrderBy(x => x);
        }
        public async Task<MailChimpServiceResult> DeleteMemberAsync(string emailAddress, mc_model.Member contact = null)
        {
            var result = new MailChimpServiceResult();
            var exists = await mailChimpManager.Members.ExistsAsync(listId, emailAddress);
            if (exists)
            {
                try
                {
                    if (contact == null)
                    {
                        contact = await mailChimpManager.Members.GetAsync(listId, emailAddress);
                    }
                    if (contact.Status == mc_model.Status.Subscribed || contact.Status == mc_model.Status.Unsubscribed)
                    {
                        await mailChimpManager.Members.DeleteAsync(listId, emailAddress);
                        contact = await mailChimpManager.Members.GetAsync(listId, emailAddress);
                    }
                    if (contact.Status != mc_model.Status.Archived)
                    {
                        log.Warning($"{emailAddress} not archived, status is {contact.Status}");
                        result.Response = MailChimpServiceResponse.NotArchived;
                        result.Contact = contact;
                    }
                    else
                    {
                        log.Information($"mailchimp address {emailAddress} archived");
                    }
                }
                catch (System.Exception xe)
                {
                    log.Error(xe, $"deleting {emailAddress} failed");
                    result.Response = MailChimpServiceResponse.Error;
                    result.Exception = xe;
                }
            }
            return result;
        }
        //public async Task 
        public async Task<IEnumerable<MailChimpServiceResult>> DeleteMemberAsync(Member member, mc_model.Member contact = null)
        {
            var results = new List<MailChimpServiceResult>();
            if (this.optionsMonitor.CurrentValue.MailChimpUpdatesEnabled)
            {
                var emailAddresses = GetMemberEmailAddresses(member);
                foreach (var emailAddress in emailAddresses)
                {
                    var result = new MailChimpServiceResult();
                    if (contact == null || contact.EmailAddress.ToLower() != emailAddress.ToLower())
                    {
                        contact = await mailChimpManager.Members.GetAsync(listId, emailAddress);
                    }
                    if (contact.Status != mc_model.Status.Archived)
                    {
                        if (this.optionsMonitor.CurrentValue.MailChimpAllowUnsubscribedToBeDeleted)
                        {
                            if (contact.Status == mc_model.Status.Unsubscribed)
                            {
                                contact.Status = mc_model.Status.Subscribed;
                                contact = await mailChimpManager.Members.AddOrUpdateAsync(listId, contact);
                                log.Warning($"[{member.Id}] unsubscribed member {emailAddress} status changed to {contact.Status}");
                            }
                        }
                        result = await DeleteMemberAsync(emailAddress);
                        contact = await mailChimpManager.Members.GetAsync(listId, emailAddress);
                        if (contact.Status != mc_model.Status.Archived)
                        {
                            log.Warning($"[{member.Id}] member {emailAddress} not archived, status is {contact.Status}");
                        }
                        else
                        {
                            log.Information($"[{member.Id}] member {emailAddress} archived");
                        }
                    }
                    results.Add(result);
                }

            }
            else
            {
                log.Warning($"mailchimp updates are disabled");
            }
            return results;
        }
        public async Task<IEnumerable<MailChimpServiceResult>> AddOrUpdateMemberAsync(Member member/*, string emailAddress, qpModel.Zone zone*/)
        {
            bool shouldArchive(Member m)
            {
                return m.IsSuspended || m.HasLeft || m.MinutesDeliveryMethod != MinutesDeliveryMethod.ByEmail;
            }
            var results = new List<MailChimpServiceResult>();
            if (this.optionsMonitor.CurrentValue.MailChimpUpdatesEnabled)
            {
                if (shouldArchive(member))
                {
                    try
                    {
                        var t = await DeleteMemberAsync(member);
                        results.AddRange(t);
                    }
                    catch (Exception xe)
                    {
                        log.Error(xe, $"deleting {member.Id} {member.Email} failed");
                        var result = new MailChimpServiceResult();
                        result.Response = MailChimpServiceResponse.Error;
                        result.Exception = xe;
                        results.Add(result);
                    }
                }
                else
                {
                    var emailAddresses = GetMemberEmailAddresses(member);
                    foreach (var emailAddress in emailAddresses)
                    {
                        try
                        {
                            var result = new MailChimpServiceResult();
                            mc_model.Member contact = null;
                            var exists = await mailChimpManager.Members.ExistsAsync(listId, emailAddress, null, false);
                            if (exists)
                            {
                                contact = await mailChimpManager.Members.GetAsync(listId, emailAddress);
                                string fname = contact.MergeFields.ContainsKey("FNAME") ? (string)contact.MergeFields["FNAME"] : string.Empty;
                                string lname = contact.MergeFields.ContainsKey("LNAME") ? (string)contact.MergeFields["LNAME"] : string.Empty;
                                if (!(
                                    (fname.Trim() == (member.FirstName?.Trim() ?? string.Empty) && lname == (member.LastName?.Trim() ?? string.Empty))
                                    || (fname == string.Empty && lname == string.Empty)))
                                {
                                    using (var db = new QParaDb(connectionString))
                                    {
                                        var matchingMembers = db.Members.Where(m => m.Email.ToLower() == emailAddress || m.MemberCount > 1 && m.SecondEmail.ToLower() == emailAddress);
                                        if (matchingMembers.Count() > 1)
                                        {

                                            log.Warning($"duplicate use of {emailAddress}: mailchimp name is {fname} {lname}:");
                                            foreach (var m in matchingMembers)
                                            {
                                                log.Warning($"--> [{m.Id}] {m.Name} uses the same email address");
                                            }
                                            continue;
                                        }
                                    }
                                    //    log.Warning($"duplicate use of {emailAddress}: existing member is {fname} {lname}, {member.Name} [{member.Id}]  uses the same email address");
                                    //continue;
                                }
                            }
                            else
                            {
                                contact = new mc_model.Member
                                {
                                    EmailAddress = emailAddress,
                                    StatusIfNew = mc_model.Status.Subscribed,
                                };
                                contact = await mailChimpManager.Members.AddOrUpdateAsync(listId, contact);
                            }

                            if (contact.Status != mc_model.Status.Unsubscribed)
                            {
                                string fname = contact.MergeFields.ContainsKey("FNAME") ? (string)contact.MergeFields["FNAME"] : string.Empty;
                                string lname = contact.MergeFields.ContainsKey("LNAME") ? (string)contact.MergeFields["LNAME"] : string.Empty;
                                if (contact.Status != mc_model.Status.Subscribed || fname != (member.FirstName?.Trim() ?? string.Empty)
                                    || lname != (member.LastName?.Trim() ?? string.Empty))
                                {
                                    var previousStatus = contact.Status;
                                    contact.Status = mc_model.Status.Subscribed;
                                    contact.MergeFields.Clear();
                                    contact.MergeFields.Add("FNAME", member.FirstName?.Trim() ?? string.Empty);
                                    contact.MergeFields.Add("LNAME", member.LastName?.Trim() ?? string.Empty);
                                    contact = await mailChimpManager.Members.AddOrUpdateAsync(listId, contact);
                                    if (contact.Status == previousStatus)
                                    {
                                        log.Information($"member [{member.Id}] {contact.EmailAddress} added/updated, status {contact.Status}");
                                    }
                                    else
                                    {
                                        log.Information($"member [{member.Id}] {contact.EmailAddress} added/updated, status changed from {previousStatus} to {contact.Status}");
                                    }
                                }
                            }
                            else
                            {
                                log.Warning($"Member [{member.Id}] {emailAddress} is unsubscribed - check if member has left, or does not want email delivery of minutes");
                                result.Response = MailChimpServiceResponse.IsUnsubscribed;
                                result.Contact = contact;
                                results.Add(result);
                            }
                        }
                        catch (Exception xe)
                        {
                            log.Error(xe, $"add/update {member.Id} {emailAddress} failed");
                            var result = new MailChimpServiceResult();
                            result.Response = MailChimpServiceResponse.Error;
                            result.Exception = xe;
                            results.Add(result);
                        }
                    }
                }
            }
            else
            {
                log.Warning($"mailchimp updates are disabled");
            }
            return results;
        }

        private static List<string> GetMemberEmailAddresses(Member member)
        {
            var emailAddresses = new List<string>();
            if (!string.IsNullOrWhiteSpace(member.Email))
            {
                emailAddresses.Add(member.Email);
            }
            if (member.MemberCount > 1 && !string.IsNullOrWhiteSpace(member.SecondEmail))
            {
                emailAddresses.Add(member.SecondEmail);
            }

            return emailAddresses;
        }

        private async Task<IEnumerable<mc_model.Member>> GetMembersAsync(mc_model.Status status)
        {
            var list = new List<mc_model.Member>();
            var total = await mailChimpManager.Members.GetTotalItemsByRequest(listId, new MemberRequest { Status = status, Limit = 100 });
            while (list.Count() < total)
            {
                var memberList = await mailChimpManager.Members.GetAllAsync(listId, new MemberRequest { Status = status, Limit = 100, Offset = list.Count() });
                list.AddRange(memberList);
            }
            return list.OrderBy(x => x.EmailAddress);
        }

    }
}
