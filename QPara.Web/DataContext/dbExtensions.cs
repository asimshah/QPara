using Fastnet.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara.Data
{
    public static class dbExtensions
    {
        public static bool ShouldMakePayments(this Member m)
        {
            return (m.SubscriptionPeriod != SubscriptionPeriod.Life
                && m.SubscriptionType != SubscriptionType.Complimentary
                && m.IsSuspended == false && !m.HasLeft);
        }
        public static void UpdatePaymentRecords(this Member m, QParaOptions options, bool writeChanges)
        {
            if (m.ShouldMakePayments())
            {
                var amountDue = m.CalculateSubscription(options);
                if (m.AmountDue != amountDue)
                {
                    if (writeChanges)
                    {
                        m.Changes.Add(new Change
                        {
                            Member = m,
                            Date = DateTimeOffset.Now,
                            MadeBy = "System",

                            Description = $"Amount Due changed from £{m.AmountDue} to £{amountDue}"
                        });
                    }
                    m.AmountDue = amountDue;
                }
                var subscriptionYear = options.GetSubscriptionYear(DateTimeOffset.UtcNow);
                var amountReceived = m.Payments.Where(x => x.SubscriptionYear == subscriptionYear).Sum(x => x.AmountReceived);
                var isWaived = m.Payments.Where(x => x.SubscriptionYear == subscriptionYear).Any(x => x.IsPaid);
                if (m.AmountReceived != amountReceived)
                {
                    if (writeChanges)
                    {
                        m.Changes.Add(new Change
                        {
                            Member = m,
                            Date = DateTimeOffset.Now,
                            MadeBy = "System",

                            Description = $"Amount Received changed from £{m.AmountReceived} to £{amountReceived}"
                        });
                    }
                    m.AmountReceived = amountReceived;
                }
                if (isWaived)
                {
                    m.PaymentIsOutstanding = false;
                }
                else
                {
                    m.PaymentIsOutstanding = m.AmountReceived < m.AmountDue;
                }
                //if (m.AmountReceived < m.AmountDue)
                //{
                //    m.PaymentIsOutstanding = true;
                //}
            }
            else
            {
                m.PaymentIsOutstanding = false;
            }
        }
        private static int CalculateSubscription(this Member m, QParaOptions options)
        {
            int amountDue = 0;
            if (m.ShouldMakePayments())
            {
                var year = options.GetFirstDayOfYear(DateTimeOffset.Now).Year;
                var currentYear = options.GetSubscriptionYear(year);

                switch (m.SubscriptionType)
                {
                    case SubscriptionType.Unknown:
                    case SubscriptionType.Standard:
                        amountDue = m.PaymentMethod == PaymentMethod.Regular ? 8 : 10;
                        break;
                    case SubscriptionType.Concession:
                        amountDue = m.PaymentMethod == PaymentMethod.Regular ? 4 : 5;
                        break;
                }
                if (m.MemberCount > 1)
                {
                    amountDue *= m.MemberCount;
                }
            }
            return amountDue;
        }
        //public static async Task EnsurePaymentRecordsUpToDate(this QParaDb db, Member m, QParaOptions options, ILogger log)
        //{
        //    //int year = DateTime.Now.Year;
        //    //var yearStart = options.GetFirstDayOfYear(DateTime.Now);// new DateTimeOffset(year, 10, 1, 0, 0, 0, TimeSpan.Zero);
        //    //var yearDates = options.GetYearDates(yearStart.Year);// GetYearDates(DateTimeOffset.Now.Year);
        //    //async Task<PaymentType> getLastPaymentType()
        //    //{
        //    //    PaymentType pt = PaymentType.Cash;
        //    //    var payments = await db.Payments.Where(p => p.MemberId == m.Id)
        //    //        .OrderByDescending(p => p.DueDate)
        //    //        .ToArrayAsync();
        //    //    foreach (var p in payments)
        //    //    {
        //    //        if (p.Type != PaymentType.Unknown)
        //    //        {
        //    //            pt = p.Type;
        //    //            break;
        //    //        }
        //    //    }
        //    //    return pt;
        //    //}
        //    //if (m.SubscriptionPeriod != SubscriptionPeriod.Life && m.SubscriptionType != SubscriptionType.Complimentary)
        //    //{
        //    //    var amount = 0;
        //    //    var paymentType = await getLastPaymentType();
        //    //    switch (m.SubscriptionType)
        //    //    {
        //    //        default:
        //    //            return;
        //    //        case SubscriptionType.Unknown:
        //    //        case SubscriptionType.Standard:
        //    //            amount = paymentType == PaymentType.StandingOrder ? 8 : 10;
        //    //            break;
        //    //        case SubscriptionType.Concession:
        //    //            amount = paymentType == PaymentType.StandingOrder ? 4 : 5;
        //    //            break;
        //    //    }
        //    //    if (m.MemberCount > 1)
        //    //    {
        //    //        amount *= m.MemberCount;
        //    //    }
        //    //    var payments = await db.Payments.Where(x => x.MemberId == m.Id).ToArrayAsync();
        //    //    payments = payments.Where(p => (p.DueDate.StripTimeAndZone() >= yearDates.first) && (p.DueDate.StripTimeAndZone() <= yearDates.last)).ToArray();
        //    //    //var payment = await db.Payments.SingleOrDefaultAsync(p => p.MemberId == m.Id && p.DueDate.Year == yearStart.Year);
        //    //    if (payments.Count() > 0)
        //    //    {
        //    //        if (payments.Count() > 1)
        //    //        {
        //    //            log.Warning($"Member {m.FirstName} {m.LastName}: multiple payments for year {(yearDates.first.ToString("ddMMMyyyy"))} to {(yearDates.last.ToString("ddMMMyyyy"))}");
        //    //        }
        //    //        foreach (var payment in payments)
        //    //        {
        //    //            if (payment.DueDate.Offset != TimeSpan.Zero)
        //    //            {
        //    //                payment.DueDate = payment.DueDate.StripTimeAndZone();
        //    //            }
        //    //        }
        //    //        var zeroItems = payments.Where(x => x.AmountDue == 0 && x.AmountReceived == 0);
        //    //        if (zeroItems.Count() > 0)
        //    //        {
        //    //            //var maxDate = zeroItems.Max(x => x.DueDate);
        //    //            //var removableItems = zeroItems.Where(x => x.DueDate != maxDate).ToArray();
        //    //            db.Payments.RemoveRange(zeroItems);
        //    //            foreach (var p in zeroItems)
        //    //            {
        //    //                log.Information($"Member {m.FirstName} {m.LastName}: zero due/recd item on {(p.DueDate.ToString("ddMMMyyyy"))} removed");
        //    //            }
        //    //        }
        //    //        // *** the following code is to correct for the errors created when extra payment records were added on
        //    //        //     crossing the new year
        //    //        if (payments.Count() > 1)
        //    //        {
        //    //            var allAreDuplicates = payments.All(x => x.AmountDue == payments.First().AmountDue) && payments.All(x => x.AmountReceived == payments.First().AmountReceived);
        //    //            if (allAreDuplicates)
        //    //            {
        //    //                log.Information($"Member {m.FirstName} {m.LastName} {payments.Count()} are duplicates");
        //    //                var rl1 = payments.OrderBy(x => x.Id).Skip(1).ToArray();
        //    //                db.Payments.RemoveRange(rl1);
        //    //                foreach (var p in rl1)
        //    //                {
        //    //                    log.Information($"Member {m.FirstName} {m.LastName}: duplicate item on {(p.DueDate.ToString("ddMMMyyyy"))} [due: {p.AmountDue}, recd: {p.AmountReceived}] removed");
        //    //                }
        //    //            }
        //    //            else
        //    //            {
        //    //                log.Information($"Member {m.FirstName} {m.LastName} {payments.Count()} are not all duplicates");
        //    //                var rl2 = payments.Where(x => !(x.AmountDue > 0 && x.AmountReceived > 0)).ToArray();
        //    //                db.Payments.RemoveRange(rl2);
        //    //                foreach (var p in rl2)
        //    //                {
        //    //                    log.Information($"Member {m.FirstName} {m.LastName}: duplicate item on {(p.DueDate.ToString("ddMMMyyyy"))} [due: {p.AmountDue}, recd: {p.AmountReceived}] removed");
        //    //                }
        //    //            }
        //    //            await db.SaveChangesAsync();
        //    //        }
        //    //        // --- the above code is to correct for the errors ---
        //    //    }
        //    //    payments = await db.Payments.Where(p => p.MemberId == m.Id && (p.DueDate >= yearDates.first) && (p.DueDate <= yearDates.last)).ToArrayAsync();
        //    //    if (payments.Count() == 0)
        //    //    {
        //    //        var payment = new Payment
        //    //        {
        //    //            AmountDue = amount,
        //    //            DueDate = yearStart,
        //    //            Member = m,
        //    //            Type = paymentType
        //    //        };
        //    //        db.Payments.Add(payment);
        //    //        log.Information($"Member {m.FirstName} {m.LastName}: payment record added for {(yearStart.ToString("ddMMMyyyy"))}");
        //    //    }
        //    //    var totalDue = payments.Sum(x => x.AmountDue);
        //    //    if (totalDue > amount)
        //    //    {
        //    //        log.Information($"Member {m.FirstName} {m.LastName}: total due is suspect, should be {amount}, found {totalDue}");
        //    //    }
        //    //    foreach (var p in payments)
        //    //    {
        //    //        if (m.JoinedOn.HasValue && p.DueDate < m.JoinedOn)
        //    //        {
        //    //            log.Warning($"Member {m.FirstName} {m.LastName}: payment due date {(p.DueDate.ToString("ddMMMyyyy"))} is earlier than the join date {(m.JoinedOn.Value.ToString("ddMMMyyyy"))}");
        //    //        }
        //    //        if (m.JoinedOn.HasValue && p.ReceivedDate.HasValue && p.ReceivedDate < m.JoinedOn)
        //    //        {
        //    //            log.Warning($"Member {m.FirstName} {m.LastName}: payment received date {(p.ReceivedDate.Value.ToString("ddMMMyyyy"))} is earlier than the join date {(m.JoinedOn.Value.ToString("ddMMMyyyy"))}");
        //    //        }
        //    //    }
        //    //}
        //    //else
        //    //{
        //    //    var payments = await db.Payments.Where(p => p.MemberId == m.Id && (p.DueDate.StripTimeAndZone() >= yearDates.first) && p.AmountDue == 0).ToArrayAsync();
        //    //    db.Payments.RemoveRange(payments);
        //    //    foreach (var p in payments)
        //    //    {
        //    //        log.Information($"Member {m.FirstName} {m.LastName}: payment on {(p.DueDate.ToString("ddMMMyyyy"))} for {p.AmountDue} (due) and {p.AmountReceived} (received) removed");
        //    //    }
        //    //}
        //    return;
        //}
        //private static (DateTimeOffset first, DateTimeOffset last) GetYearDates(int year, QParaOptions options)
        //{
        //    // the assumption here is that year is the Qpara definition of year, ie. 2017 for dates from 1Oct2017 to 30Sep2018
        //    string monthName = options.FirstMonthOfYear.ToLower();
        //    var monthNumber = Array.IndexOf(months, monthName) + 1;
        //    var fdy = new DateTimeOffset(year, monthNumber, 1, 0, 0, 0, TimeSpan.Zero);
        //    var ldy = fdy.AddYears(1).AddDays(-1);
        //    return (StripTimeAndZone(fdy), StripTimeAndZone(ldy));
        //}
        //private static DateTimeOffset GetFirstDayOfYear(DateTimeOffset dt, QParaOptions options)
        //{
        //    var r = GetYearDates(dt.Year, options);
        //    if (r.first > dt)
        //    {
        //        r = GetYearDates(dt.Year - 1, options);
        //    }
        //    return r.first;
        //}
        //private static DateTimeOffset StripTimeAndZone(DateTimeOffset dt)
        //{
        //    return new DateTimeOffset(dt.Year, dt.Month, dt.Day, 0, 0, 0, TimeSpan.Zero);
        //}
    }
}
