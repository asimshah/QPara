using Fastnet.Core;
using Fastnet.Core.Web;
using Fastnet.QPara.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public class ReprocessPaymentRecords : SinglePipelineTask
    {
        //private readonly QParaDbContextFactory dbf;
        private QParaDb db;
        private readonly QParaOptions options;
        private readonly string connectionString;
        public ReprocessPaymentRecords(/*QParaDbContextFactory dbf, */ILoggerFactory loggerFactory, IOptions<QParaOptions> qpOptions,
            IConfiguration cfg, IWebHostEnvironment environment/*, IOptions<ServiceOptions> serviceOptionsConfiguration*/) : base(loggerFactory)
        {
            //this.dbf = dbf;
            this.options = qpOptions.Value;
            connectionString = environment.LocaliseConnectionString(cfg.GetConnectionString("QParaDb"));
        }

        protected async override Task<ITaskState> DoTask(ITaskState taskState, ScheduleMode mode, CancellationToken cancellationToken, params object[] args)
        {
            log.Information("started");
            using (db = new QParaDb(connectionString))
            {
                var members = db.Members.AsEnumerable()
                    //.Include(x => x.Payments)
                    //.Include(x => x.Changes)
                    .Where(x => x.ShouldMakePayments())
                    ;
                foreach (var m in members.ToArray())
                {
                    m.UpdatePaymentRecords(this.options, true);
                    await db.SaveChangesAsync();
                }

            }
            return null;
        }
    }
}
