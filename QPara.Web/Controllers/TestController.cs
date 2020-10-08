using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Controllers;
using MailChimp.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using System;
using System.IO;
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
        //private readonly MailChimpManager mailChimpManager;
        private readonly MailChimpService mailChimpService;
        public TestController(MailChimpService mailChimpService,  ILogger<TestController> logger, IWebHostEnvironment env) : base(logger, env)
        {
            this.mailChimpService = mailChimpService;
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
            foreach(var list in lists)
            {
                var members = await mcm.Members.GetAllAsync(list.Id);
                foreach(var member in members)
                {
                    log.Information($"{(++count).ToString("00#")}. {list.Name}, {member.EmailAddress}, status {member.Status}");
                }
            }
            return SuccessResult();
        }
        [HttpGet("mailchimp/2/list")]
        public async Task<IActionResult> DumpMailChimpMembers2()
        {
            //int count = 0;
            //var members = await this.mailChimpService.GetAllMembersAsync();
            //foreach (var member in members)
            //{
            //    log.Information($"{++count:00#}. {member.ListId}, {member.EmailAddress}, status {member.Status}");
            //}
            return SuccessResult();
        }
        [HttpGet("mailchimp/3/list")]
        public async Task<IActionResult> DumpMailChimpMembers3()
        {
            int count = 0;
            var members = await this.mailChimpService.GetArchivedMembersAsync();
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
            var members = await this.mailChimpService.GetCleanedMembersAsync();
            foreach (var member in members)
            {
                log.Information($"{++count:00#}. {member.ListId}, {member.EmailAddress}, status {member.Status}");
            }
            return SuccessResult();
        }
    }
}