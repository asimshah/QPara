using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Controllers;
using Fastnet.QPara.Data;
using MailChimp.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
//using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace QPara.Web.Controllers
{
    public class TestPacket
    {
        public int Index { get; set; }
        public string Message { get; set; }
    }

    [Route("test")]
    [ApiController]
    public class TestController : BaseController
    {
        private readonly QParaDb db;
        private readonly MailChimpService mailchimpService;
        public TestController(QParaDb db, MailChimpService mailChimpService, ILogger<TestController> logger, IWebHostEnvironment env) : base(logger, env)
        {
            this.mailchimpService = mailChimpService;
            this.db = db;
        }
        [HttpGet("echo/{msg}")]
        public IActionResult Echo(string msg)
        {
            return SuccessResult(msg);
        }
        [HttpGet("error/1")]
        public IActionResult Error1()
        {
            throw new Exception("test exception");

        }
        [HttpGet("error/2")]
        public IActionResult Error2()
        {
            return ErrorResult("data result success = false");

        }
        [HttpGet("get/packet")]
        public IActionResult GetPacket()
        {
            var dp = new TestPacket
            {
                Index = 53,
                Message = "Index is 53"
            };
            return SuccessResult(dp);

        }
        [HttpPost("post/packet")]
        public async Task<IActionResult> PostPacket()
        {
            var tp = await this.Request.FromBody<TestPacket>();
            log.Information($"TestPacket: {tp.Index}, {tp.Message}");
            return SuccessResult();
        }
        [HttpPost("return/packet")]
        public async Task<IActionResult> PostAndReturnPacket()
        {
            var tp = await this.Request.FromBody<TestPacket>();
            log.Information($"TestPacket: {tp.Index}, {tp.Message}");
            tp.Index++;
            return SuccessResult(tp);
        }
        [HttpGet("download/sheet")]
        public IActionResult DownloadSheet()
        {
            var file = Path.Combine(environment.ContentRootPath, "Data", "Sheets", "Member-List-24Sep2019-12-51-18.xlsx");
            var cd = new System.Net.Mime.ContentDisposition
            {
                FileName = Path.GetFileName(file),
                DispositionType = "attachment"
            };
            Response.Headers.Add("Content-Disposition", cd.ToString());
            var stream = System.IO.File.OpenRead(file);
            return new FileStreamResult(stream, new MediaTypeHeaderValue("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }
        [HttpGet("mailchimp/1/list")]
        public async Task<IActionResult> DumpMailChimpMembers1()
        {
            //var mcm = mailChimpManager;
            string apikey = @"11875bda055e8f4bcabdfc0b03712e78-us2";
            var mcm = new MailChimpManager(apikey);
            var lists = await mcm.Lists.GetAllAsync();
            int count = 0;
            foreach (var list in lists)
            {
                var members = await mcm.Members.GetAllAsync(list.Id);
                foreach (var member in members)
                {
                    log.Information($"{(++count).ToString("00#")}. {list.Name}, {member.EmailAddress}, status {member.Status}");
                }
            }
            return SuccessResult();
        }
        [HttpGet("mailchimp/2/list")]
        public async Task<IActionResult> DumpMailChimpMembers2()
        {
            int count = 0;
            var members = await this.mailchimpService.GetAllMembersAsync();
            members = members.OrderBy(m => m.EmailAddress);
            foreach (var member in members)
            {
                log.Information($"{++count:00#}. {member.ListId}, {member.EmailAddress}, status {member.Status}");
            }
            return SuccessResult();
        }
        [HttpGet("mailchimp/3/list")]
        public async Task<IActionResult> DumpMailChimpMembers3()
        {
            int count = 0;
            var members = await this.mailchimpService.GetArchivedMembersAsync();
            foreach (var member in members)
            {
                log.Information($"{++count:00#}. {member.ListId}, {member.EmailAddress}, status {member.Status}");
            }
            return SuccessResult();
        }
        [HttpGet("mailchimp/4/list")]
        public async Task<IActionResult> DumpMailChimpMembers4()
        {
            int count = 0;
            var members = await this.mailchimpService.GetCleanedMembersAsync();
            foreach (var member in members)
            {
                log.Information($"{++count:00#}. {member.ListId}, {member.EmailAddress}, status {member.Status}");
            }
            return SuccessResult();
        }
        [HttpGet("mailchimp/debug")]
        public async Task<IActionResult> DebugMailChimpMembers()
        {

            var members = await this.mailchimpService.GetAllMembersAsync();
            var mailChimpAddresses = await this.mailchimpService.GetAllMemberEmailAddressesAsync();
            mailChimpAddresses = mailChimpAddresses.OrderBy(x => x);
            var t = mailChimpAddresses.SingleOrDefault(x => x.ToLower() == "hughpym@yahoo.co.uk");
            return SuccessResult();
        }
        [HttpGet("mailchimp/sync/dryrun")]
        public async Task<IActionResult> SyncDryRun()
        {
            bool shouldArchive(Member m)
            {
                return m.IsSuspended || m.HasLeft || m.MinutesDeliveryMethod != MinutesDeliveryMethod.ByEmail;
            }
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            var membersWithEmailAddresses = this.GetMembersWithEmailAddresses();

            foreach (Member member in membersWithEmailAddresses)
            {
                switch (member.MemberCount)
                {
                    case 1:
                        log.Information($"{member.Email} will be added/updated");
                        break;
                    case 2:
                        log.Information($"{member.Email} and {member.SecondEmail} will be added/updated");
                        break;
                }
                var emailAddresses = GetMemberEmailAddresses(member);
                string apikey = @"f81745b38c1d4c6ef1b8427bf387741c-us20";
                var mcm = new MailChimpManager(apikey);
                foreach (var emailAddress in emailAddresses)
                {
                    var exists = await mcm.Members.ExistsAsync("697f752504", emailAddress, null, false);
                    log.Information($"{emailAddress} exists = {exists}");
                }
                //await this.mailchimpService.AddOrUpdateMemberAsync(member);
            }
            var mailChimpAddresses = await this.mailchimpService.GetAllMemberEmailAddressesAsync();

            foreach (var address in mailChimpAddresses)
            {
                var m = await db.Members.FirstOrDefaultAsync(x => x.Email.ToLower() == address.ToLower() || x.MemberCount > 1 && x.SecondEmail.ToLower() == address.ToLower());
                if (m == null)
                {
                    log.Information($"{address} will be archived");
                    //await this.mailchimpService.DeleteMemberAsync(address);
                }
            }
            return SuccessResult();
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
        [HttpGet("mailchimp/test")]
        public async Task<IActionResult> MailchimpTest()
        {
            string listId = "697f752504";
            string apikey = @"f81745b38c1d4c6ef1b8427bf387741c-us20";
            var mcm = new MailChimpManager(apikey);
            string ck = "chris@kitching.clara.co.uk";
            var exists = await mcm.Members.ExistsAsync(listId, ck, null, false);
            var contact = await mcm.Members.GetAsync(listId, ck);
            //string hp = "hughpym@yahoo.co.uk";
            //string sp = "susanpym@yahoo.co.uk";
            //var m = await db.Members.FindAsync(207);
            //var addresses = GetMemberEmailAddresses(m);
            //string apikey = @"f81745b38c1d4c6ef1b8427bf387741c-us20";
            //var mcm = new MailChimpManager(apikey);
            //var sp_contact = await mcm.Members.GetAsync(listId, sp);
            //var hp_contact = await mcm.Members.GetAsync(listId, hp);
            //Debugger.Break();
            //var results = this.mailchimpService.AddOrUpdateMemberAsync(m);
            return SuccessResult();
        }
        private IEnumerable<Member> GetMembersWithEmailAddresses()
        {
            var membersWithEmailAddresses = db.Members
                .Where(m =>
                    (m.Email != null && m.Email.Trim() != "") || (m.MemberCount > 1 && m.SecondEmail != null && m.SecondEmail.Trim() != "")
                   )
                .OrderBy(m => m.Email)
                .AsEnumerable();
            return membersWithEmailAddresses;
        }
    }
}