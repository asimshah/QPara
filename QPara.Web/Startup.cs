using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.QPara;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;

namespace QPara.Web
{
    public class Startup
    {
        private ILogger log;
        private IWebHostEnvironment environment;
        public Startup(IConfiguration configuration, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            Configuration = configuration;
            this.log = logger;
            this.environment = env;
            var name = Process.GetCurrentProcess().ProcessName;
            var siteVersion = GetSiteVersion();
            var versions = System.Reflection.Assembly.GetExecutingAssembly().GetVersions();
            log.Information($"Music {siteVersion} site started ({name}), using versions:");
            foreach (var item in versions.OrderByDescending(x => x.DateTime))
            {
                log.Information($"{item.Name}, {item.DateTime.ToDefaultWithTime()}, [{item.Version}, {item.PackageVersion}]");
            }
            //var version = typeof(Startup).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
            ////version = Microsoft.Extensions.PlatformAbstractions.PlatformServices.Default.Application.ApplicationVersion;
            //log.Information($"QPara Membership {version.ToString()} site started");
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddControllersWithViews()
                .AddNewtonsoftJson(options => {
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });
            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
            var qpOptions = new QParaOptions();
            Configuration.GetSection("QParaOptions").Bind(qpOptions);
            log.Information($"Authentication idle timeout is {qpOptions.AuthenticationIdleTimeout} minutes");
            services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme,
                    options =>
                    {
                        options.ExpireTimeSpan = TimeSpan.FromMinutes(qpOptions.AuthenticationIdleTimeout);
                        options.LoginPath = new PathString("/auth/login");
                        options.AccessDeniedPath = new PathString("/auth/denied");
                        options.SlidingExpiration = true;
                        options.Events = new CookieAuthenticationEvents
                        {
                            OnRedirectToLogin = ctx =>
                            {
                                if (ctx.Request.Path.StartsWithSegments("/membership") &&
                                ctx.Response.StatusCode == (int)HttpStatusCode.OK)
                                {
                                    ctx.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                                }
                                else
                                {
                                    ctx.Response.Redirect(ctx.RedirectUri);
                                }
                                return Task.FromResult(0);
                            }
                        };

                    });
            services.AddOptions();
            services.Configure<QParaOptions>(Configuration.GetSection("QParaOptions"));

            services.Configure<QParaDbOptions>(Configuration.GetSection("QParaDbOptions"));
            var cs = environment.LocaliseConnectionString(Configuration.GetConnectionString("QParaDb"));
            services.AddDbContext<QParaDb>(options =>
            {
                try
                {
                    options.UseSqlServer(cs, sqlServerOptions =>
                        {
                            if (environment.IsDevelopment())
                            {
                                sqlServerOptions.CommandTimeout(60 * 3);
                            }
                        })
                        .EnableDetailedErrors()
                        .EnableSensitiveDataLogging()
                        .UseLazyLoadingProxies();
                }
                catch (Exception xe)
                {
                    log.Error(xe);
                    throw;
                }
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();
            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
            using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                try
                {
                    var db = scope.ServiceProvider.GetService<QParaDb>();
                    QParaDbInitialiser.Initialise(db);
                }
                catch (System.Exception xe)
                {
                    log.Error(xe, $"Error initialising QParaDb");
                }
            }
        }
        private string GetSiteVersion()
        {
            var assemblyLocation = System.Reflection.Assembly.GetExecutingAssembly().Location;
            return System.Diagnostics.FileVersionInfo.GetVersionInfo(assemblyLocation).ProductVersion;
        }
    }
}
