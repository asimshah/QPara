import { Component, OnInit, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { getCleanDate, getFormattedDate, getMonthNames } from '../shared/common.functions';
import { EnumValue, DialogResult } from '../../fastnet/core/core.types';
import { MemberEditorComponent } from '../member-editor/member-editor.component';
import { ColumnSelectorComponent } from '../column-selector/column-selector.component';
import { FilterCriteriaComponent } from '../filter-criteria/filter-criteria.component';
import { ColumnNames, SubscriptionType, SubscriptionPeriod, MinutesDeliveryMethod, LeavingReasons, Member, ColumnMetadata, MemberEditResult, PaymentType, PaymentMethod, FilterType, DateFilter, NumberFilter, ZoneFilter, SubscriptionPeriodFilter, SubscriptionTypeFilter, MatchType, PaymentMethodFilter, MinutesDeliveryMethodFilter, BoolFilter } from '../shared/common.types';
import { MembersService } from '../services/members.service';
import { BusyIndicatorComponent } from '../../fastnet/controls/busy-indicator.component';

enum TF {
    True,
    False
}

@Component({
    selector: 'qp-members',
    templateUrl: './members.component.html',
    styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
    @ViewChild(BusyIndicatorComponent, { static: false }) busyIndicator: BusyIndicatorComponent;
    @ViewChild(MemberEditorComponent, { static: false }) memberEditor: MemberEditorComponent;
    @ViewChild(ColumnSelectorComponent, { static: false }) columnSelector: ColumnSelectorComponent;
    @ViewChild(FilterCriteriaComponent, { static: false }) filterDialog: FilterCriteriaComponent;
    columnSelectorGuard: boolean = false;
    selectionCriteriaGuard: boolean = false;
    ColumnNames = ColumnNames;
    SubscriptionType = SubscriptionType;
    SubscriptionPeriod = SubscriptionPeriod;
    MinutesDeliveryMethod = MinutesDeliveryMethod;
    LeavingReasons = LeavingReasons;
    trueFalseValues: EnumValue[];
    isReady = false;
    advancedFilterPanelIsOpen: boolean = false;
    pageHeader: string;
    showEmailAsMailToLink: boolean;
    currentPageMemberList: Member[] = [];
    searchMatchedMemberList: Member[] = [];
    fullMemberList: Member[];
    currentFilter: ColumnMetadata[] = [];
    filterableCriteria: ColumnMetadata[]; // used by filter dialog
    filterDescription: string;
    zoneList: EnumValue[];
    currentSubscriptionYear: string;
    searchText: string;
    pageSize = 25;
    currentPageStart: number;
    currentPageEnd: number;
    currentPage = 0;
    totalPages = 0;
    //editingMember: Member;
    constructor(
        private router: Router,
        //private dialogService: ModalDialogService,
        private memberService: MembersService) {
        this.loadEnumValues();
        this.pageHeader = "Full list of members";
    }

    async ngOnInit() {
        this.memberService.ready$.subscribe(async (v) => {
            if (v === true) {
                this.zoneList = await this.memberService.getZoneList();
            }
        });
        MemberEditorComponent.newMemberCreated$.subscribe(async (id) => {
            console.log(`new member created with id ${id}`);
            let cp = this.currentPage;
            await this.loadFilteredMembersFromServer();
            this.currentPage = cp;
        });
        let parameters = await this.memberService.getParametersV2();
        //console.log("parameters loaded");
        this.currentFilter = this.getDefaultFilterCriteria();
        //this.zoneList = await this.memberService.getZoneList();
        this.currentSubscriptionYear = await this.memberService.getCurrentSubscriptionYear();
        this.showEmailAsMailToLink = parameters.showEmailAsMailToLink;
        await this.loadFilteredMembersFromServer();
        this.isReady = true;
    }
    getPageStats() {
        let count = 0;
        for (let m of this.searchMatchedMemberList) {
            count += m.memberCount;
        }
        return `Showing ${this.currentPageStart} to ${this.currentPageEnd} of ${this.searchMatchedMemberList.length} rows for ${count} members`;
    }
    canShowColumn(name: ColumnNames): boolean {
        let cd = this.currentFilter.find(x => x.name === name);
        if (cd && cd.show) {
            return true;
        }
        return false;
    }

    nextPage() {
        //console.log(`next/previous: current = ${this.currentPage}, total = ${this.totalPages}`);
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.loadCurrentPageMemberList();
        }
    }
    previousPage() {
        //console.log(`next/previous: current = ${this.currentPage}, total = ${this.totalPages}`);
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadCurrentPageMemberList();
        }
    }
    isListFiltered(): boolean {
        let filterCount = 0;
        this.currentFilter.forEach(x => {
            if (x.filter && x.filter.enabled === true) {
                filterCount++;
            }
        });
        return filterCount > 0;
    }
    async downloadAsSheet() {
        let filters = this.currentFilter;
        console.log(`sending request for excel sheet ...`);
        this.memberService.downloadSheet(filters);
    }

    private receiveSheet(data: Blob) {
        //console.log(`received sheet as a blob`);
        let url = window.URL.createObjectURL(data);
        //console.log(`blob url is ${url}`);
        window.open(url);
    }
    private matchSearchText(m: Member): boolean {
        if (this.searchText && this.searchText.length > 0) {
            let re = new RegExp(this.searchText, 'i')
            let r = m.firstName !== null && re.test(m.firstName)
                || m.lastName !== null && re.test(m.lastName)
                || m.email !== null && re.test(m.email)
                || m.memberCount > 1 && m.secondEmail != null && re.test(m.secondEmail)
                || m.address !== null && re.test(m.address)
                || m.mobileNumber !== null && re.test(m.mobileNumber)
                || m.phoneNumber !== null && re.test(m.phoneNumber)
                ;
            return r;
        }
        return true;
    }
    async onMemberRowClick(m: Member) {
        //console.log(`edit requested for ${m.name}`);
        this.memberEditor.open(m, (r) => this.memberEditorClosed(r));
    }
    memberEditorClosed(result: MemberEditResult): void {
        if (!result.cancelled) {
            if (result.newMemberCreated || result.memberDeleted || result.memberChanged) {
                this.loadFilteredMembersFromServer();
                this.loadCurrentPageMemberList();
            } else {

            }
        } else {
            //console.log('editor closed/cancelled');
        }
    }
    onClearSearchClick() {
        this.loadSearchMatchedMemberList();
        this.currentPage = 1;
    }
    onSearchClick() {
        this.loadSearchMatchedMemberList();
        this.currentPage = 1;
    }
    getMonthDue(mn: number): string {
        if (mn > 0) {
            return getMonthNames()[mn - 1];
        }
        return "";
    }
    getPaymentType(t: PaymentType): string {
        let s = "";
        switch (t) {
            case PaymentType.BankTransfer:
                s = "BT";
                break;
            case PaymentType.Cash:
                s = "CS";
                break;
            case PaymentType.Cheque:
                s = "CQ";
                break;
            case PaymentType.PayPal:
                s = "PP";
                break;
            case PaymentType.StandingOrder:
                s = "SO";
                break;
        }
        return s;
    }
    getFormattedPaymentMethod(pm: PaymentMethod): string {
        switch (pm) {
            default:
            case PaymentMethod.OneOff:
                return "";
            case PaymentMethod.Regular:
                return "R";
        }
    }
    getAmountDue(m: Member): string {
        if (m.subscriptionPeriod !== SubscriptionPeriod.Life
            && m.subscriptionType !== SubscriptionType.Complimentary
            && m.isSuspended === false && !m.hasLeft) {
            return `£${m.amountDue}`;
        }
        return "";
    }
    getAmountReceived(m: Member): string {
        if (m.subscriptionPeriod !== SubscriptionPeriod.Life
            && m.subscriptionType !== SubscriptionType.Complimentary
            && m.isSuspended === false && !m.hasLeft) {
            return `£${m.amountReceived}`;
        }
        return "";
    }
    getJoinedOnDate(m: Member): string {
        if (m.joinedOn) {
            return this.formatDate(m.joinedOn);
        }
        return "";
    }
    formatDate(d: Date | string): string {
        return getFormattedDate(d);
    }
    getFormattedJson(data: any): string {
        return JSON.stringify(data, null, "\t");
    }
    openColumnSelector() {
        this.columnSelector.open(() => {
        });
    }
    openFilterDialog() {
        let userSettableFilters = this.currentFilter.filter(x => x.isUserSettable === true)!;
        this.filterDialog.open(userSettableFilters, async (r: DialogResult) => {
            if (r === DialogResult.cancel) { // 'cos only cancel recreates the column instances
                for (let col of userSettableFilters) {
                    let index = this.currentFilter.findIndex(x => x.name === col.name);
                    if (index >= 0) {
                        this.currentFilter[index] = col;
                    }
                }
            } else {
                await this.loadFilteredMembersFromServer();
            }
        });
    }
    private loadEnumValues(): any {
        this.setTrueFalseValues();
    }
    private setTrueFalseValues() {
        this.trueFalseValues = [];
        for (var v in TF) {
            if (typeof TF[v] === 'number') {
                this.trueFalseValues.push({ value: <any>TF[v], name: v });
            }
        }
    }
    private ensureMemberDates(m: Member) {
        m.joinedOn = this.ensureDate(m.joinedOn);
        m.leftOn = this.ensureDate(m.leftOn);
        for (let p of m.payments) {
            this.ensureDate(p.receivedDate);
        }
    }
    private ensureDate(d: string | Date | null): Date | null {
        if (typeof d === "string") {
            let nd = new Date(d);
            return new Date(nd.getUTCFullYear(), nd.getUTCMonth(), nd.getUTCDate());
        }
        return d;
    }

    private buildFilterDescription(): string {
        let descr: string[] = [];
        let filters = this.getEnabledFilters();
        for (let x of filters) {
            if (x.filter) {
                let cn = ColumnNames[x.name];
                switch (x.filter.filterType) {
                    case FilterType.Boolean:
                        descr.push(`${cn}=${x.filter.matchAgainst ? "Yes" : "No"}`);
                        break;
                    case FilterType.Number:
                        descr.push(`${cn}=${x.filter.matchAgainst}`);
                        break;
                    case FilterType.SubscriptionType:
                        descr.push(`${cn}=${SubscriptionType[x.filter.matchAgainst]}`);
                        break;
                    case FilterType.SubscriptionPeriod:
                        descr.push(`${cn}=${SubscriptionPeriod[x.filter.matchAgainst]}`);
                        break;
                    case FilterType.PaymentMethod:
                        descr.push(`${cn}=${PaymentMethod[x.filter.matchAgainst]}`);
                        break;
                    case FilterType.MinutesDeliveryMethod:
                        descr.push(`${cn}=${MinutesDeliveryMethod[x.filter.matchAgainst]}`);
                        break;
                    case FilterType.Zone:
                        descr.push(`${cn}=${x.filter.matchAgainst.value}`);
                        break;
                    case FilterType.Date:
                        let df = <DateFilter>x.filter;
                        let fd = "";
                        if (df.greaterThan) {
                            fd = "from " + this.formatDate(df.greaterThan);
                        }
                        let td = "";
                        if (df.lessThan) {
                            if (fd.length > 0) {
                                td += " ";
                            }
                            td += "to " + this.formatDate(df.lessThan);
                        }
                        descr.push(`${cn}=${fd}${td}`);
                        break;
                }
            }
        }
        return descr.join(", ");
    }

    private getEnabledFilters(): ColumnMetadata[] {
        return this.currentFilter.filter(x => x.filter && x.filter!.enabled === true);
    }
    private async loadFilteredMembersFromServer() {
        this.busyIndicator.busy = true;
        this.filterDescription = this.buildFilterDescription();
        let filters = this.getEnabledFilters();
        this.fullMemberList = await this.memberService.getFilteredMembersV2(filters);
        for (let m of this.searchMatchedMemberList) {
            this.ensureMemberDates(m);
        }
        //console.log(`${this.fullMemberList.length} members loaded into full member list`);
        this.loadSearchMatchedMemberList();
        this.busyIndicator.busy = false;
    }
    private loadSearchMatchedMemberList() {
        this.searchMatchedMemberList = [];
        for (let m of this.fullMemberList) {
            if (this.matchSearchText(m)) {
                this.searchMatchedMemberList.push(m);
            }
        }
        this.currentPage = 0;
        this.totalPages = Math.ceil(this.searchMatchedMemberList.length / this.pageSize);
        //console.log(`${this.searchMatchedMemberList.length} members match the current search text`);
        this.loadCurrentPageMemberList();
    }
    private loadCurrentPageMemberList() {
        this.currentPageMemberList = [];
        let s = this.currentPage * this.pageSize;
        let end = s + this.pageSize;
        for (var i = s; i < Math.min(end, this.searchMatchedMemberList.length); ++i) {
            setTimeout((j) => {
                this.currentPageMemberList.push(this.searchMatchedMemberList[j]);
            }, 0, i);
        }
        this.currentPageStart = s + 1;
        this.currentPageEnd = this.currentPageMemberList.length + s;
        //console.log(`Paging: current ${this.currentPage}, total ${this.totalPages}, showing members ${this.currentPageStart} to ${this.currentPageEnd}`);
    }
    private getDefaultFilterCriteria(): ColumnMetadata[] {
        let defaultCriteria: ColumnMetadata[] = [];
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.FirstName }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.LastName }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.Name }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.Email }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.SecondEmail }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.Address }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.PostCode }));

        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.PhoneNumber }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.MobileNumber }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: true, name: ColumnNames.MemberCount, filter: new NumberFilter(false, 2) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: true, name: ColumnNames.ZoneNumber, filter: new ZoneFilter(false, new EnumValue()) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: true, name: ColumnNames.SubscriptionPeriod, filter: new SubscriptionPeriodFilter(false) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: true, name: ColumnNames.SubscriptionType, filter: new SubscriptionTypeFilter(false) }));

        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.JoinedOn, filter: new DateFilter(false, MatchType.Range) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: true, name: ColumnNames.PaymentMethod, filter: new PaymentMethodFilter(false) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.MinutesDeliveryMethod, filter: new MinutesDeliveryMethodFilter(false) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.DeliveryNote }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.IsSuspended, filter: new BoolFilter(false, false) }));

        // these are the default colums and criteria
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.HasLeft, filter: new BoolFilter(true, false) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.LeftOn, filter: new DateFilter(false, MatchType.Range) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.LeavingReason }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { isUserSettable: true, show: false, name: ColumnNames.PaymentIsOutstanding, filter: new BoolFilter(false, false) }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: false, name: ColumnNames.MonthDue }));

        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.AmountDue }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.AmountReceived }));
        defaultCriteria.push(Object.assign(new ColumnMetadata(), { show: true, name: ColumnNames.IsPaid }));
        return defaultCriteria;
    }
}

