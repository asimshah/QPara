using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.Core.Web.Controllers;
using Fastnet.QPara;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace QPara.Web.Controllers
{
    public class Credentials
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    [Route("auth")]
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly QParaOptions options;
        private readonly QParaAuth qpAuth;
        private readonly QParaDb db;
        public AuthController(IOptions<QParaOptions> options, QParaDb qparaDb, ILogger<AuthController> logger, IWebHostEnvironment env) : base(logger, env)
        {
            this.options = options.Value;
            this.db = qparaDb;
            this.qpAuth = GetAuthData();
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login()
        {
            var credentials = await this.Request.FromBody<Credentials>();
            bool isStreetRep = false;
            int srZone = 0;
            bool isAdmin = IsValidAdmin(credentials.Email, credentials.Password);
            if (!isAdmin)
            {
                var sr = IsValidStreetRep(credentials.Email, credentials.Password);
                if (sr.valid)
                {
                    isStreetRep = true;
                    srZone = sr.zone;
                }
            }
            if (isAdmin || isStreetRep)
            {
                var claims = isAdmin ? new List<Claim>
                {
                    new Claim(ClaimTypes.Name, credentials.Email, ClaimValueTypes.String, options.SiteUrl),
                    new Claim("AuthorisedCommitteeMember", "")
                } : new List<Claim>
                {
                    new Claim(ClaimTypes.Name, credentials.Email, ClaimValueTypes.String, options.SiteUrl),
                    new Claim("StreetRepresentative", srZone.ToString(), ClaimValueTypes.Integer)
                };
                var userIdentity = new ClaimsIdentity(claims, "SecureLogin");
                var userPrincipal = new ClaimsPrincipal(userIdentity);

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                    userPrincipal,
                    new AuthenticationProperties
                    {
                        ExpiresUtc = DateTime.UtcNow.AddMinutes(options.AuthenticationIdleTimeout),
                        IsPersistent = true,
                        AllowRefresh = true
                    });
                log.Information($"{credentials.Email} logged in");
                var profile = userPrincipal.GetProfile();
                return SuccessResult(profile);
            }
            log.Warning($"login attempted by {credentials.Email} - denied");
            return ErrorResult("Email and/or password invalid");
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return SuccessResult();
        }
        private bool IsValidAdmin(string username, string password)
        {
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                var admins = qpAuth.Admins;
                if (admins.Any(u => u.Name.ToLower() == username.ToLower() && u.Password == password))
                {
                    return true;
                }
            }
            return false;
        }
        private (bool valid, int zone) IsValidStreetRep(string username, string password)
        {
            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                var reps = db.Zones.Select(z => new { z.StreetRep, z.Number });
                var rep = reps.SingleOrDefault(sr => sr.StreetRep.Email.ToLower() == username.ToLower() && qpAuth.StreetRepPassword == password);
                if (rep != null)
                {
                    return (true, rep.Number);
                }
            }
            return (false, 0);
        }
        private QParaAuth GetAuthData()
        {
            var folder = this.environment.ContentRootPath;
            var filename = Path.Combine(folder, "auth.qpara");

            var qparaFile = System.IO.File.ReadAllText(filename);
            return qparaFile.ToInstance<QParaAuth>();
        }
    }
}