using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Controllers;
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
        public TestController(ILogger<TestController> logger, IWebHostEnvironment env) : base(logger, env)
        {
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
    }
}