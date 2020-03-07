using System;

namespace Fastnet.QPara
{
    public static class qparaExtensions
    {
        private static string[] months =
        {
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        };
        public static string GetCurrentSubscriptionYear(this QParaOptions options)
        {
            var year = options.GetFirstDayOfYear(DateTimeOffset.Now).Year;
            return options.GetSubscriptionYear(year);
        }
        public static string GetSubscriptionYear(this QParaOptions options, DateTimeOffset date)
        {
            var fd = options.GetFirstDayOfYear(date);
            return options.GetSubscriptionYear(fd.Year);

        }
        public static string GetSubscriptionYear(this QParaOptions options, int year)
        {
            return $"{year}/{(year + 1) % 2000}";
        }
        public static DateTimeOffset GetFirstDayOfYear(this QParaOptions options, DateTimeOffset dt)
        {
            var r = options.GetYearDates(dt.Year);
            if (r.first > dt)
            {
                r = options.GetYearDates(dt.Year - 1);
            }
            return r.first;
        }
        public static DateTimeOffset GetLastDayOfYear(this QParaOptions options, DateTimeOffset dt)
        {
            var r = options.GetYearDates(dt.Year);
            if (r.first > dt)
            {
                r = options.GetYearDates(dt.Year - 1);
            }
            return r.last;
        }
        public static DateTimeOffset StripTimeAndZone(this DateTimeOffset dt)
        {
            return new DateTimeOffset(dt.Year, dt.Month, dt.Day, 0, 0, 0, TimeSpan.Zero);
        }
        public static string ToMonthName(this int mn)
        {
            if (mn > 0)
            {
                return months[mn - 1];
            }
            else
            {
                return string.Empty;
            }
        }
        private static (DateTimeOffset first, DateTimeOffset last) GetYearDates(this QParaOptions options, int year)
        {
            // the assumption here is that year is the Qpara definition of year, ie. 2017 for dates from 1Oct2017 to 30Sep2018
            string monthName = options.FirstMonthOfYear;//.ToLower();
            var monthNumber = Array.IndexOf(months, monthName) + 1;
            var fdy = new DateTimeOffset(year, monthNumber, 1, 0, 0, 0, TimeSpan.Zero);
            var ldy = fdy.AddYears(1).AddDays(-1);
            return (fdy.StripTimeAndZone(),ldy.StripTimeAndZone());
        }

    }
}
