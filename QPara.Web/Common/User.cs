using Fastnet.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public static class JavaScriptConvert
    {
        public static HtmlString SerializeObject(object value)
        {
            using (var stringWriter = new StringWriter())
            using (var jsonWriter = new JsonTextWriter(stringWriter))
            {
                var serializer = new JsonSerializer
                {
                    // Let's use camelCasing as is common practice in JavaScript
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };

                // We don't want quotes around object names
                jsonWriter.QuoteName = false;
                serializer.Serialize(jsonWriter, value);

                return new HtmlString(stringWriter.ToString());
            }
        }
    }
    public enum UserType
    {
        Unknown,
        Administrator,
        StreetRepresentative
    }
    public class UserProfile
    {
        public string Name { get; set; }
        public UserType Type { get; set; }
        public int ZoneNumber { get; set; } // if Type == StreetRepresentative
    }
    public class AdminCredentials
    {
        public string Name { get; set; }
        public string Password { get; set; }
    }
    public class QParaAuth
    {
        public static QParaAuth[] GetAdmins(IWebHostEnvironment env)
        {
            var folder = env.ContentRootPath;
            var filename = Path.Combine(folder, "auth.qpara");
            if (!File.Exists(filename))
            {
                return new QParaAuth[0];
            }
            var qparaFile = File.ReadAllText(filename);
            var users = qparaFile.ToInstance<QParaAuth[]>();
            return users;
        }
        public string StreetRepPassword { get; set; }
        public AdminCredentials[] Admins { get; set; }
    }
    public static class profileExtensions
    {
        public static UserProfile GetProfile(this ClaimsPrincipal user)
        {
            UserProfile profile = new UserProfile();
            var claims = user.Claims;
            var nc = claims.Single(c => c.Type == ClaimTypes.Name);
            profile.Name = nc.Value;
            var acm = claims.SingleOrDefault(c => c.Type == "AuthorisedCommitteeMember");
            if (acm != null)
            {
                profile.Type = UserType.Administrator;
            }
            else
            {
                var sr = claims.SingleOrDefault(c => c.Type == "StreetRepresentative");
                if (sr != null)
                {
                    profile.Type = UserType.StreetRepresentative;
                    profile.ZoneNumber = int.Parse(sr.Value);
                }
            }
            return profile;
        }
    }
}
