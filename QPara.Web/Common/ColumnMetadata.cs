using Fastnet.Core;
using Fastnet.QPara.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;

namespace Fastnet.QPara
{
    public static class cmdMethods
    {
        public static ColumnMetadata[] ToColumnMetadata(this string jsonString)
        {
            return jsonString == null ? new ColumnMetadata[0] : jsonString.ToInstance<ColumnMetadata[]>();
        }
    }
    [JsonConverter(typeof(FilterJsonConverter))]
    public abstract class Filter
    {
        public bool Enabled { get; set; } = false;
    }
    public abstract class Filter<T> : Filter
    {

        public T MatchAgainst { get; set; }
        public virtual bool Match(T value)
        {
            return true;
        }
    }
    public class BoolFilter : Filter<bool>
    {
        public override bool Match(bool value)
        {
            return Enabled ? value == MatchAgainst : true;
        }
    }
    public class NumberFilter : Filter<int>
    {
        public override bool Match(int value)
        {
            return Enabled ? value == MatchAgainst : true;
        }
    }
    public class EnumValue
    {
        public int Value { get; set; }
        public string Name { get; set; }
    }
    public class ZoneFilter : Filter<EnumValue>
    {
        public override bool Match(EnumValue value)
        {
            return Enabled ? value.Value == MatchAgainst.Value : true;
        }
    }



    public class DateFilter : Filter<DateTimeOffset>
    {
        //[Flags]
        public enum MatchType
        {
            Exact,
            Range
        }
        // we can have exact date (test against MatchAgainst)
        // greater the or equal to date
        // less than or equal to date
        public MatchType Type { get; set; }
        public DateTimeOffset? GreaterThan { get; set; }
        public DateTimeOffset? LessThan { get; set; }
        public override bool Match(DateTimeOffset value)
        {
            var r = true;
            if (Enabled)
            {
                //var value = date.Value;
                var dateValue = value.StripTimeAndZone();
                var matchAgainst = MatchAgainst.StripTimeAndZone();
                switch (Type)
                {
                    case MatchType.Exact:
                        r = matchAgainst == dateValue;
                        break;
                    case MatchType.Range:
                        if (GreaterThan.HasValue && dateValue < GreaterThan.Value.StripTimeAndZone())
                        {
                            r = false;

                        }
                        else if (LessThan.HasValue && dateValue > LessThan.Value.StripTimeAndZone())
                        {
                            r = false;
                        }
                        break;
                }
            }

            return r;
        }
    }
    public class EnumFilter<T> : Filter<T> where T : struct, IConvertible
    {
        public IEnumerable<T> MatchAgainstValues { get; set; }
        public override bool Match(T value)
        {
            Debug.Assert(typeof(T).IsEnum);
            var r = true;
            if (Enabled)
            {
                r = false;
                if (MatchAgainstValues != null && MatchAgainstValues.Count() > 0)
                {
                    foreach (var item in MatchAgainstValues)
                    {
                        if (value.Equals(item))
                        {
                            r = true;
                            break;
                        }
                    }
                }
                else
                {
                    r = value.Equals(MatchAgainst);
                }
            }
            return r;
        }
    }
    public class SubscriptionTypeFilter : EnumFilter<SubscriptionType>
    {

    }
    public class SubscriptionPeriodFilter : EnumFilter<SubscriptionPeriod>
    {

    }
    public class PaymentMethodFilter : EnumFilter<PaymentMethod>
    {

    }
    public class MinutesDeliveryMethodFilter : EnumFilter<MinutesDeliveryMethod>
    {

    }
    public enum Names
    {
        [Description("First Name")]
        FirstName,
        [Description("Last Name")]
        LastName,
        Name,
        Email,
        HasEmail,
        [Description("Phone")]
        PhoneNumber,
        [Description("Mobile")]
        MobileNumber,
        Address, // includes flat
        PostCode,
        [Description("Zone")]
        ZoneNumber,
        [Description("Joined On")]
        JoinedOn,
        [Description("Count")]
        MemberCount,
        [Description("Type")]
        SubscriptionType,
        [Description("Period")]
        SubscriptionPeriod,
        [Description("Method")]
        PaymentMethod,
        [Description("Minutes Delivery Method")]
        MinutesDeliveryMethod,
        [Description("Delivery Note")]
        DeliveryNote,
        [Description("Is Suspended")]
        IsSuspended,
        [Description("Has Left")]
        HasLeft,
        [Description("Left On")]
        LeftOn,
        [Description("Leaving Reason")]
        LeavingReason,
        [Description("Due In")]
        MonthDue,
        [Description("Due")]
        AmountDue,
        [Description("Received")]
        AmountReceived,
        [Description("Is Outstanding")]
        PaymentIsOutstanding,
        [Description("Is Paid")]
        IsPaid
    }
    public class ColumnMetadata
    {
        public bool IsUserSettable { get; set; }
        public bool Show { get; set; }
        public Names Name { get; set; }
        public string DisplayName { get { return Name.ToDescription(); } }
        public Filter Filter { get; set; }
        public override string ToString()
        {
            return $"{Name.ToString()}, show = {Show}, filter {Filter.ToJson()}";
        }
    }
    public class FilterJsonConverter : JsonConverter
    {
        enum FilterType
        {
            Boolean,
            Number,
            Date,
            SubscriptionType,
            SubscriptionPeriod,
            PaymentMethod,
            MinutesDeliveryMethod,
            Zone
        }
        public override bool CanWrite => false;
        public override bool CanRead => true;
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(Filter);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            Filter filter = null;
            var jsonObject = JObject.Load(reader);
            var ft = (FilterType)jsonObject["filterType"].Value<int>();

            switch (ft)
            {
                case FilterType.Boolean:
                    filter = new BoolFilter();
                    break;
                case FilterType.Date:
                    filter = new DateFilter();
                    break;
                case FilterType.MinutesDeliveryMethod:
                    filter = new MinutesDeliveryMethodFilter();
                    break;
                case FilterType.Number:
                    filter = new NumberFilter();
                    break;
                case FilterType.PaymentMethod:
                    filter = new PaymentMethodFilter();
                    break;
                case FilterType.SubscriptionPeriod:
                    filter = new SubscriptionPeriodFilter();
                    break;
                case FilterType.SubscriptionType:
                    filter = new SubscriptionTypeFilter();
                    break;
                case FilterType.Zone:
                    filter = new ZoneFilter();
                    break;

            }
            serializer.Populate(jsonObject.CreateReader(), filter);
            return filter;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }

}
