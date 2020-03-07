using Fastnet.QPara.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public enum StandardLists
    {
        [Description("Members")]
        ZoneMembers,
        [Description("Payments Outstanding")]
        ZonePaymentsOutstanding,
        [Description("Minutes Delivery")]
        ZoneMinutes,
        [Description("Minutes by Email")]
        ZoneEmailMinutes,
        [Description("All Members")]
        AllMembers
    }
    public abstract class BaseList
    {
        protected readonly StandardLists StandardList;
        protected List<ColumnMetadata> columns { get; private set; }
        public BaseList(StandardLists sl)
        {
            this.StandardList = sl;
            this.columns = new List<ColumnMetadata>();
        }
    }
    public abstract class StandardMemberList: BaseList
    {

        public StandardMemberList(StandardLists sl): base(sl)
        {           
            AddCommonColumns();
            AddColumns();
        }
        protected abstract void AddColumns();
        public IEnumerable<ColumnMetadata> GetColumns()
        {
            return columns;
        }
        private void AddCommonColumns()
        {
            columns.Add(new ColumnMetadata { Name = Names.Name, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.Email, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.Address, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.PhoneNumber, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.MobileNumber, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.MemberCount, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.HasLeft, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = false } });
            columns.Add(new ColumnMetadata { Name = Names.IsSuspended, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = false } });
            
        }
    }
    //public class StreetRepList 
    //{
    //    public StreetRepList() 
    //    {
    //        //columns.Add(new ColumnMetadata { Name = Names.Name, Show = true });
    //        //columns.Add(new ColumnMetadata { Name = Names.Email, Show = true });
    //        //columns.Add(new ColumnMetadata { Name = Names.Address, Show = true });
    //        //columns.Add(new ColumnMetadata { Name = Names.PhoneNumber, Show = true });
    //        //columns.Add(new ColumnMetadata { Name = Names.MobileNumber, Show = true });
    //    }
    //}
    public class FullMemberList : StandardMemberList
    {
        public FullMemberList() : base(StandardLists.AllMembers)
        {
        }

        protected override void AddColumns()
        {
            
        }
    }
    public abstract class ZoneMemberList : StandardMemberList
    {
        protected readonly int zoneNumber;
        public ZoneMemberList(StandardLists sl, int zoneNumber) : base(sl)
        {
            this.zoneNumber = zoneNumber;
            //columns.Add(new ColumnMetadata { Name = Names.ZoneNumber, Show = false, Filter = new NumberFilter { Enabled = true, MatchAgainst = zoneNumber } });
            columns.Add(new ColumnMetadata { Name = Names.ZoneNumber, Show = false, Filter = new ZoneFilter { Enabled = true, MatchAgainst = new EnumValue { Value = zoneNumber, Name = "some zone" } } });
        }
        
    }
    public class ZoneMembers : ZoneMemberList
    {
        public ZoneMembers(int zoneNumber) : base(StandardLists.ZoneMembers, zoneNumber)
        {

        }

        protected override void AddColumns()
        {
            columns.Add(new ColumnMetadata { Name = Names.SubscriptionPeriod, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.SubscriptionType, Show = true });
            
        }
    }
    public class ZonePaymentsOutstanding : ZoneMemberList
    {
        public ZonePaymentsOutstanding(int zoneNumber) : base(StandardLists.ZonePaymentsOutstanding, zoneNumber)
        {

        }

        protected override void AddColumns()
        {
            columns.Add(new ColumnMetadata { Name = Names.SubscriptionPeriod, Show = false, Filter = new SubscriptionPeriodFilter { Enabled = true, MatchAgainst = SubscriptionPeriod.Annual } });
            columns.Add(new ColumnMetadata { Name = Names.SubscriptionType, Show = false, Filter = new SubscriptionTypeFilter { Enabled = true, MatchAgainstValues = new SubscriptionType[] { SubscriptionType.Standard, SubscriptionType.Concession } } });
            //columns.Add(new ColumnMetadata { Name = Names.IsPaid, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = false } });
            columns.Add(new ColumnMetadata { Name = Names.PaymentMethod, Show = false,Filter = new PaymentMethodFilter { Enabled = true, MatchAgainst = PaymentMethod.OneOff } });
            columns.Add(new ColumnMetadata { Name = Names.PaymentIsOutstanding, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = true } });
            columns.Add(new ColumnMetadata { Name = Names.AmountDue, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.AmountReceived, Show = true });
        }
    }
    public class ZoneMinutes : ZoneMemberList
    {
        public ZoneMinutes(int zoneNumber) : base(StandardLists.ZoneMinutes, zoneNumber)
        {

        }

        protected override void AddColumns()
        {
            //columns.Add(new ColumnMetadata { Name = Names.IsPaid, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = true } });
            columns.Add(new ColumnMetadata { Name = Names.MinutesDeliveryMethod, Show = true, Filter = new MinutesDeliveryMethodFilter { Enabled = true, MatchAgainstValues = new MinutesDeliveryMethod[] { MinutesDeliveryMethod.ByEmail, MinutesDeliveryMethod.ByHand } } });
            columns.Add(new ColumnMetadata { Name = Names.DeliveryNote, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.PaymentMethod, Show = true });
        }
    }
    public class ZoneEmailMinutes : ZoneMemberList
    {
        public ZoneEmailMinutes(int zoneNumber) : base(StandardLists.ZoneEmailMinutes, zoneNumber)
        {

        }

        protected override void AddColumns()
        {
            //columns.Add(new ColumnMetadata { Name = Names.IsPaid, Show = false, Filter = new BoolFilter { Enabled = true, MatchAgainst = true } });
            columns.Add(new ColumnMetadata { Name = Names.MinutesDeliveryMethod, Show = true, Filter = new MinutesDeliveryMethodFilter { Enabled = true, MatchAgainst = MinutesDeliveryMethod.ByEmail } });
            columns.Add(new ColumnMetadata { Name = Names.DeliveryNote, Show = true });
            columns.Add(new ColumnMetadata { Name = Names.PaymentMethod, Show = true });
        }
    }
}
