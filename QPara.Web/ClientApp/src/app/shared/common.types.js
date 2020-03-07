"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var LeavingReasons;
(function (LeavingReasons) {
    LeavingReasons[LeavingReasons["Other"] = 0] = "Other";
    LeavingReasons[LeavingReasons["MovedAway"] = 1] = "MovedAway";
    LeavingReasons[LeavingReasons["DeathOrIllness"] = 2] = "DeathOrIllness";
    LeavingReasons[LeavingReasons["WorkCommitments"] = 3] = "WorkCommitments";
})(LeavingReasons = exports.LeavingReasons || (exports.LeavingReasons = {}));
var MinutesDeliveryMethod;
(function (MinutesDeliveryMethod) {
    MinutesDeliveryMethod[MinutesDeliveryMethod["ByEmail"] = 0] = "ByEmail";
    MinutesDeliveryMethod[MinutesDeliveryMethod["ByHand"] = 1] = "ByHand";
    MinutesDeliveryMethod[MinutesDeliveryMethod["NotRequired"] = 2] = "NotRequired";
})(MinutesDeliveryMethod = exports.MinutesDeliveryMethod || (exports.MinutesDeliveryMethod = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod[PaymentMethod["OneOff"] = 0] = "OneOff";
    PaymentMethod[PaymentMethod["Regular"] = 1] = "Regular";
})(PaymentMethod = exports.PaymentMethod || (exports.PaymentMethod = {}));
var SubscriptionPeriod;
(function (SubscriptionPeriod) {
    SubscriptionPeriod[SubscriptionPeriod["Annual"] = 0] = "Annual";
    SubscriptionPeriod[SubscriptionPeriod["Life"] = 1] = "Life";
})(SubscriptionPeriod = exports.SubscriptionPeriod || (exports.SubscriptionPeriod = {}));
var SubscriptionType;
(function (SubscriptionType) {
    SubscriptionType[SubscriptionType["Standard"] = 0] = "Standard";
    SubscriptionType[SubscriptionType["Concession"] = 1] = "Concession";
    SubscriptionType[SubscriptionType["Complimentary"] = 2] = "Complimentary";
    SubscriptionType[SubscriptionType["Unknown"] = 3] = "Unknown";
})(SubscriptionType = exports.SubscriptionType || (exports.SubscriptionType = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType[PaymentType["Cash"] = 0] = "Cash";
    PaymentType[PaymentType["Cheque"] = 1] = "Cheque";
    PaymentType[PaymentType["StandingOrder"] = 2] = "StandingOrder";
    PaymentType[PaymentType["PayPal"] = 3] = "PayPal";
    PaymentType[PaymentType["BankTransfer"] = 4] = "BankTransfer";
    PaymentType[PaymentType["NotKnown"] = 5] = "NotKnown";
})(PaymentType = exports.PaymentType || (exports.PaymentType = {}));
var MemberType;
(function (MemberType) {
    // only used in stats
    MemberType[MemberType["Normal"] = 0] = "Normal";
    MemberType[MemberType["Associate"] = 1] = "Associate";
})(MemberType = exports.MemberType || (exports.MemberType = {}));
var FilterType;
(function (FilterType) {
    FilterType[FilterType["Boolean"] = 0] = "Boolean";
    FilterType[FilterType["Number"] = 1] = "Number";
    FilterType[FilterType["Date"] = 2] = "Date";
    FilterType[FilterType["SubscriptionType"] = 3] = "SubscriptionType";
    FilterType[FilterType["SubscriptionPeriod"] = 4] = "SubscriptionPeriod";
    FilterType[FilterType["PaymentMethod"] = 5] = "PaymentMethod";
    FilterType[FilterType["MinutesDeliveryMethod"] = 6] = "MinutesDeliveryMethod";
    FilterType[FilterType["Zone"] = 7] = "Zone";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var MatchType;
(function (MatchType) {
    MatchType[MatchType["Exact"] = 0] = "Exact";
    MatchType[MatchType["Range"] = 1] = "Range";
})(MatchType = exports.MatchType || (exports.MatchType = {}));
var Payment = /** @class */ (function () {
    function Payment() {
    }
    return Payment;
}());
exports.Payment = Payment;
var NoteLine = /** @class */ (function () {
    function NoteLine() {
    }
    return NoteLine;
}());
exports.NoteLine = NoteLine;
var Note = /** @class */ (function () {
    function Note() {
    }
    return Note;
}());
exports.Note = Note;
var Zone = /** @class */ (function () {
    function Zone() {
    }
    return Zone;
}());
exports.Zone = Zone;
var Change = /** @class */ (function () {
    function Change() {
    }
    return Change;
}());
exports.Change = Change;
var Member = /** @class */ (function () {
    function Member() {
    }
    return Member;
}());
exports.Member = Member;
var MemberEditResult = /** @class */ (function () {
    function MemberEditResult() {
        this.cancelled = false;
        this.memberDeleted = false;
        this.newMemberCreated = false;
        this.memberChanged = false;
    }
    return MemberEditResult;
}());
exports.MemberEditResult = MemberEditResult;
var Parameters = /** @class */ (function () {
    function Parameters() {
    }
    return Parameters;
}());
exports.Parameters = Parameters;
var Filter = /** @class */ (function () {
    function Filter(enabled) {
        this.enabled = enabled;
    }
    return Filter;
}());
exports.Filter = Filter;
var EnumFilter = /** @class */ (function (_super) {
    __extends(EnumFilter, _super);
    function EnumFilter(enabled, anyOf) {
        var _this = _super.call(this, enabled) || this;
        if (anyOf) {
            _this.matchAgainstValues = anyOf;
        }
        else {
            _this.matchAgainstValues = [];
        }
        return _this;
    }
    return EnumFilter;
}(Filter));
exports.EnumFilter = EnumFilter;
var BoolFilter = /** @class */ (function (_super) {
    __extends(BoolFilter, _super);
    function BoolFilter(enabled, ma) {
        var _this = _super.call(this, enabled) || this;
        _this.filterType = FilterType.Boolean;
        _this.matchAgainst = ma;
        return _this;
    }
    BoolFilter.prototype.setMatchAgainstValue = function (v) {
        console.log("setMatchAgainstValue(" + v + ")");
    };
    return BoolFilter;
}(Filter));
exports.BoolFilter = BoolFilter;
var NumberFilter = /** @class */ (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter(enabled, ma) {
        var _this = _super.call(this, enabled) || this;
        _this.filterType = FilterType.Number;
        _this.matchAgainst = ma;
        return _this;
    }
    return NumberFilter;
}(Filter));
exports.NumberFilter = NumberFilter;
var ZoneFilter = /** @class */ (function (_super) {
    __extends(ZoneFilter, _super);
    function ZoneFilter(enabled, ma) {
        var _this = _super.call(this, enabled) || this;
        _this.filterType = FilterType.Zone;
        _this.matchAgainst = ma;
        return _this;
    }
    return ZoneFilter;
}(Filter));
exports.ZoneFilter = ZoneFilter;
var DateFilter = /** @class */ (function (_super) {
    __extends(DateFilter, _super);
    function DateFilter(enabled, type /*, exactMatch?: Date, greaterThan?: Date, lessThan?: Date*/) {
        var _this = _super.call(this, enabled) || this;
        _this.filterType = FilterType.Date;
        _this.greaterThan = null;
        _this.lessThan = null;
        _this.type = type;
        return _this;
        //this.matchAgainst = exactMatch;
        //this.greaterThan = greaterThan;
        //this.lessThan = lessThan;
    }
    return DateFilter;
}(Filter));
exports.DateFilter = DateFilter;
var SubscriptionTypeFilter = /** @class */ (function (_super) {
    __extends(SubscriptionTypeFilter, _super);
    function SubscriptionTypeFilter(enabled, anyOf) {
        var _this = _super.call(this, enabled, anyOf) || this;
        _this.filterType = FilterType.SubscriptionType;
        return _this;
    }
    return SubscriptionTypeFilter;
}(EnumFilter));
exports.SubscriptionTypeFilter = SubscriptionTypeFilter;
var SubscriptionPeriodFilter = /** @class */ (function (_super) {
    __extends(SubscriptionPeriodFilter, _super);
    function SubscriptionPeriodFilter(enabled, anyOf) {
        var _this = _super.call(this, enabled, anyOf) || this;
        _this.filterType = FilterType.SubscriptionPeriod;
        return _this;
    }
    return SubscriptionPeriodFilter;
}(EnumFilter));
exports.SubscriptionPeriodFilter = SubscriptionPeriodFilter;
var PaymentMethodFilter = /** @class */ (function (_super) {
    __extends(PaymentMethodFilter, _super);
    function PaymentMethodFilter(enabled, anyOf) {
        var _this = _super.call(this, enabled, anyOf) || this;
        _this.filterType = FilterType.PaymentMethod;
        return _this;
    }
    return PaymentMethodFilter;
}(EnumFilter));
exports.PaymentMethodFilter = PaymentMethodFilter;
var MinutesDeliveryMethodFilter = /** @class */ (function (_super) {
    __extends(MinutesDeliveryMethodFilter, _super);
    function MinutesDeliveryMethodFilter(enabled, anyOf) {
        var _this = _super.call(this, enabled, anyOf) || this;
        _this.filterType = FilterType.MinutesDeliveryMethod;
        return _this;
    }
    return MinutesDeliveryMethodFilter;
}(EnumFilter));
exports.MinutesDeliveryMethodFilter = MinutesDeliveryMethodFilter;
var ColumnNames;
(function (ColumnNames) {
    ColumnNames[ColumnNames["FirstName"] = 0] = "FirstName";
    ColumnNames[ColumnNames["LastName"] = 1] = "LastName";
    ColumnNames[ColumnNames["Name"] = 2] = "Name";
    ColumnNames[ColumnNames["Email"] = 3] = "Email";
    ColumnNames[ColumnNames["HasEmail"] = 4] = "HasEmail";
    ColumnNames[ColumnNames["PhoneNumber"] = 5] = "PhoneNumber";
    ColumnNames[ColumnNames["MobileNumber"] = 6] = "MobileNumber";
    ColumnNames[ColumnNames["Address"] = 7] = "Address";
    ColumnNames[ColumnNames["PostCode"] = 8] = "PostCode";
    ColumnNames[ColumnNames["ZoneNumber"] = 9] = "ZoneNumber";
    ColumnNames[ColumnNames["JoinedOn"] = 10] = "JoinedOn";
    ColumnNames[ColumnNames["MemberCount"] = 11] = "MemberCount";
    ColumnNames[ColumnNames["SubscriptionType"] = 12] = "SubscriptionType";
    ColumnNames[ColumnNames["SubscriptionPeriod"] = 13] = "SubscriptionPeriod";
    ColumnNames[ColumnNames["PaymentMethod"] = 14] = "PaymentMethod";
    ColumnNames[ColumnNames["MinutesDeliveryMethod"] = 15] = "MinutesDeliveryMethod";
    ColumnNames[ColumnNames["DeliveryNote"] = 16] = "DeliveryNote";
    ColumnNames[ColumnNames["IsSuspended"] = 17] = "IsSuspended";
    ColumnNames[ColumnNames["HasLeft"] = 18] = "HasLeft";
    ColumnNames[ColumnNames["LeftOn"] = 19] = "LeftOn";
    ColumnNames[ColumnNames["LeavingReason"] = 20] = "LeavingReason";
    ColumnNames[ColumnNames["MonthDue"] = 21] = "MonthDue";
    ColumnNames[ColumnNames["AmountDue"] = 22] = "AmountDue";
    ColumnNames[ColumnNames["AmountReceived"] = 23] = "AmountReceived";
    ColumnNames[ColumnNames["PaymentIsOutstanding"] = 24] = "PaymentIsOutstanding";
    ColumnNames[ColumnNames["IsPaid"] = 25] = "IsPaid";
})(ColumnNames = exports.ColumnNames || (exports.ColumnNames = {}));
var StandardLists;
(function (StandardLists) {
    StandardLists[StandardLists["ZoneMembers"] = 0] = "ZoneMembers";
    StandardLists[StandardLists["ZonePaymentsOutstanding"] = 1] = "ZonePaymentsOutstanding";
    StandardLists[StandardLists["ZoneMinutes"] = 2] = "ZoneMinutes";
})(StandardLists = exports.StandardLists || (exports.StandardLists = {}));
var ColumnMetadata = /** @class */ (function () {
    function ColumnMetadata() {
        this.isUserSettable = false;
        this.show = false;
    }
    return ColumnMetadata;
}());
exports.ColumnMetadata = ColumnMetadata;
//export enum UserType {
//    Administrator,
//    StreetRepresentative
//}
//export class UserProfile {
//    name: string;
//    type: UserType;
//    zoneNumber: number;
//}
var LeaverJoiners = /** @class */ (function () {
    function LeaverJoiners() {
    }
    return LeaverJoiners;
}());
exports.LeaverJoiners = LeaverJoiners;
var SubscriptionTypeCounts = /** @class */ (function () {
    function SubscriptionTypeCounts() {
    }
    return SubscriptionTypeCounts;
}());
exports.SubscriptionTypeCounts = SubscriptionTypeCounts;
var SubscriptionPeriodCounts = /** @class */ (function () {
    function SubscriptionPeriodCounts() {
    }
    return SubscriptionPeriodCounts;
}());
exports.SubscriptionPeriodCounts = SubscriptionPeriodCounts;
var MembershipCounts = /** @class */ (function () {
    function MembershipCounts() {
    }
    return MembershipCounts;
}());
exports.MembershipCounts = MembershipCounts;
var Statistics = /** @class */ (function () {
    function Statistics() {
    }
    return Statistics;
}());
exports.Statistics = Statistics;
var SubscriptionYears = /** @class */ (function () {
    function SubscriptionYears() {
    }
    return SubscriptionYears;
}());
exports.SubscriptionYears = SubscriptionYears;
//export class ParametersEx extends Parameters {
//    zones: Zone[];
//    subscriptionYears: string[];
//    currentSubscriptionYear: string;
//}
var EmailAddresses = /** @class */ (function () {
    function EmailAddresses() {
    }
    return EmailAddresses;
}());
exports.EmailAddresses = EmailAddresses;
var DocumentInfo = /** @class */ (function () {
    function DocumentInfo() {
    }
    return DocumentInfo;
}());
exports.DocumentInfo = DocumentInfo;
//# sourceMappingURL=common.types.js.map