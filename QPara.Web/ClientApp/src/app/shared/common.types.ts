import { EnumValue, ListItem } from "../../fastnet/core/core.types";


export enum LeavingReasons {
    Other,
    MovedAway,
    DeathOrIllness,
    WorkCommitments
}
export enum MinutesDeliveryMethod {
    ByEmail,
    ByHand,
    NotRequired
}
export enum PaymentMethod {
    OneOff,
    Regular
}
export enum SubscriptionPeriod {
    Annual,
    Life
}
export enum SubscriptionType {
    Standard,
    Concession,
    Complimentary,
    Unknown
}
export enum PaymentType {
    Cash,
    Cheque,
    StandingOrder,
    PayPal,
    BankTransfer,
    NotKnown
}
export enum MemberType {
    // only used in stats
    Normal,
    Associate
}
export enum FilterType {
    Boolean,
    Number,
    Date,
    SubscriptionType,
    SubscriptionPeriod,
    PaymentMethod,
    MinutesDeliveryMethod,
    Zone
}
export enum MatchType {
    Exact,
    Range
}
export class Payment {
    id: number;
    subscriptionYear: string;
    subscriptionYearIndex: number;
    receivedDate: Date | null;
    amountReceived: number;
    type: PaymentType;
    isPaid: boolean;
    notes: Note[];
    subscriptionYearItem: ListItem<number> | undefined;
}


export class NoteLine {
    index: number;
    line: string
}
export class Note {
    id: number;
    createdOn: Date;
    userName: string;
    formattedCreatedOn: string;
    noteLines: NoteLine[];
}
export class Zone {
    id: number;
    number: number;
    description: string;
    //streetRep: Member;
    streetRepId: number;
    streetRepDescription: string;
}

export class Change {
    dateTime: string;
    madeBy: string;
    description: string;
    memberName: string;
    zoneNumber: number
}
export class Member {
    id: number;
    //title: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    secondEmail: string;
    hasEmail: boolean;
    phoneNumber: string;
    mobileNumber: string;
    flat: string;
    address: string;
    postCode: string;
    zoneNumber: number;
    memberCount: number;
    isAssociate: boolean;
    subscriptionPeriod: SubscriptionPeriod;
    subscriptionType: SubscriptionType;
    joinedOn: Date | null;
    leftOn: Date | null;
    leavingReason: LeavingReasons;
    isSuspended: boolean;
    expired: boolean; // obsolete
    hasLeft: boolean;
    paymentMethod: PaymentMethod;
    payments: Payment[];
    //earliestPaymentDate: Date | null;
    isPaid: boolean;
    minutesDeliveryMethod: MinutesDeliveryMethod;
    deliveryNote: string;
    notes: Note[];
    changes: Change[];
    paymentIsOutstanding: boolean;
    monthDue: number;
    amountDue: number;
    amountReceived: number;
    zoneItem: EnumValue;
}
export class MemberEditResult {
    cancelled: boolean = false;
    memberDeleted = false;
    newMemberCreated: boolean = false;
    memberChanged = false;
    member: Member;
}

export class Parameters {
    showEmailAsMailToLink: boolean;
}

export abstract class Filter<T> {
    // the corresponding server side Filter type does not contain this property
    // because it is consumed in the JSON parsing logic to produce the correct .Net Filter type
    abstract filterType: FilterType;
    //private _enabled: boolean = false;
    //get enabled(): boolean {
    //    return this._enabled;
    //}
    //set enabled(v: boolean) {
    //    if (v !== this._enabled) {
    //        this._enabled = v;
    //        this.onEnabledChanged();
    //    }
    //}
    matchAgainst?: T;
    constructor(public enabled: boolean) {

    }

}
export abstract class EnumFilter<T> extends Filter<T> {
    matchAgainstValues: T[];
    constructor(enabled: boolean, anyOf?: T[]) {
        super(enabled);
        if (anyOf) {
            this.matchAgainstValues = anyOf;
        } else {
            this.matchAgainstValues = [];
        }
    }
}

export class BoolFilter extends Filter<boolean> {
    filterType = FilterType.Boolean;
    constructor(enabled: boolean, ma: boolean) {
        super(enabled);
        this.matchAgainst = ma;
    }
    setMatchAgainstValue(v: any) {
        console.log(`setMatchAgainstValue(${v})`);
    }
}
export class NumberFilter extends Filter<number> {
    filterType = FilterType.Number;
    constructor(enabled: boolean, ma: number) {
        super(enabled);
        this.matchAgainst = ma;
    }
}
export class ZoneFilter extends Filter<EnumValue> {
    filterType = FilterType.Zone;
    constructor(enabled: boolean, ma: EnumValue) {
        super(enabled);
        this.matchAgainst = ma;
    }
}
export class DateFilter extends Filter<Date> {
    filterType = FilterType.Date;
    greaterThan: Date | null = null;
    lessThan: Date | null = null;
    type: MatchType;
    constructor(enabled: boolean, type: MatchType/*, exactMatch?: Date, greaterThan?: Date, lessThan?: Date*/) {
        super(enabled);
        this.type = type;
        //this.matchAgainst = exactMatch;
        //this.greaterThan = greaterThan;
        //this.lessThan = lessThan;
    }
}
export class SubscriptionTypeFilter extends EnumFilter<SubscriptionType>
{
    filterType = FilterType.SubscriptionType;
    constructor(enabled: boolean, anyOf?: SubscriptionType[]) {
        super(enabled, anyOf);

    }
}
export class SubscriptionPeriodFilter extends EnumFilter<SubscriptionPeriod>
{
    filterType = FilterType.SubscriptionPeriod;
    constructor(enabled: boolean, anyOf?: SubscriptionPeriod[]) {
        super(enabled, anyOf);
    }
}
export class PaymentMethodFilter extends EnumFilter<PaymentMethod>
{
    filterType = FilterType.PaymentMethod;
    constructor(enabled: boolean, anyOf?: PaymentMethod[]) {
        super(enabled, anyOf);
    }
}
export class MinutesDeliveryMethodFilter extends EnumFilter<MinutesDeliveryMethod>
{
    filterType = FilterType.MinutesDeliveryMethod;
    constructor(enabled: boolean, anyOf?: MinutesDeliveryMethod[]) {
        super(enabled, anyOf);

    }
}
export enum ColumnNames {
    FirstName,
    LastName,
    Name,
    Email,
    HasEmail,
    PhoneNumber,
    MobileNumber,
    Address, // includes flat
    PostCode,
    ZoneNumber,
    JoinedOn,
    MemberCount,
    SubscriptionType,
    SubscriptionPeriod,
    PaymentMethod,
    MinutesDeliveryMethod,
    DeliveryNote,
    IsSuspended,
    HasLeft,
    LeftOn,
    LeavingReason,
    MonthDue,
    AmountDue,
    AmountReceived,
    PaymentIsOutstanding,
    IsPaid
}
export enum StandardLists {
    ZoneMembers,
    ZonePaymentsOutstanding,
    ZoneMinutes
}
export class ColumnMetadata {
    isUserSettable: boolean = false;
    show: boolean = false;
    name: ColumnNames;
    filter?: Filter<any>;
}
//export enum UserType {
//    Administrator,
//    StreetRepresentative
//}
//export class UserProfile {
//    name: string;
//    type: UserType;
//    zoneNumber: number;
//}
export class LeaverJoiners {
    yearName: string;
    totalMembers: number;
    totalJoiners: number;
    totalLeavers: number;
    totalAssociateMembers: number;
    totalAssociateJoiners: number;
    totalAssociateLeavers: number;
    totalMoved: number;
    totalDeathsIllness: number;
    totalWorkCommitments: number;
    totalOtherReasons: number;
}
export class SubscriptionTypeCounts {
    standard: number;
    concession: number;
    complimentary: number;
    total: number;
}
export class SubscriptionPeriodCounts {
    annual: SubscriptionTypeCounts;
    life: SubscriptionTypeCounts;
}
export class MembershipCounts {
    fullMembers: SubscriptionPeriodCounts;
    associates: SubscriptionPeriodCounts;
}
export class Statistics {
    counts: MembershipCounts;
    messages: string[];
    leaverJoiners: LeaverJoiners[];
}

export class SubscriptionYears {
    subscriptionYears: string[];
    currentSubscriptionYear: string;
}

//export class ParametersEx extends Parameters {
//    zones: Zone[];
//    subscriptionYears: string[];
//    currentSubscriptionYear: string;
//}
export class EmailAddresses {
    addressesForMembers: string[];
    addressesForMinutes: string[];
    addressesForPaymentsOutstanding: string[];
}
export class DocumentInfo {
    name: string;
    description: string;
}
export class MailchimpContact {
    emailAddress: string;
    unsubscribeReason: string;
}
export class MailchimpInformation {
    updatesEnabled: boolean;
    subscribed: MailchimpContact[];
    unsubscribed: MailchimpContact[];
    archived: MailchimpContact[];
    cleaned: MailchimpContact[];
    membersReceivingEmail: string[];
    membersDecliningEmail: string[];
    membersThatHaveLeft: string[];
    suspendedMembers: string[];

}
