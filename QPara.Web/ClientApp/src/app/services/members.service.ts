import { Injectable, OnInit } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { Parameters, Zone, PaymentType, ColumnMetadata, Member, EmailAddresses, Note, DocumentInfo, Change, Statistics, SubscriptionYears, MailchimpInformation } from '../shared/common.types';
import { EnumValue } from '../../fastnet/core/core.types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MembersService extends BaseService implements OnInit {
    public ready$ = new BehaviorSubject<boolean>(false);
    private subscriptionYears: string[];
    private currentSubscriptionYear: string;
    private zones: Zone[];
    private zoneList: EnumValue[];
    private subscriptionYearList: EnumValue[];
    private paymentTypes: EnumValue[];
    constructor(http: HttpClient) {
        super(http, "membership");
    }
    async ngOnInit() {
        await this.getZoneList();
        this.ready$.next(true);
    }
    getPaymentTypes(): EnumValue[] {
        if (!this.paymentTypes) {
            this.paymentTypes = [];
            let i = 0;
            for (var v in PaymentType) {
                if (typeof PaymentType[v] === 'number') {
                    let pt = <PaymentType>i;
                    this.paymentTypes.push({ value: <any>PaymentType[v], name: this.getPaymentTypeDisplayName(v) });
                }
                ++i;
            }
        }
        return this.paymentTypes;
    }
    private async getSubscriptionYears() {
        let query = `get/subscription/years`;
        let r = await this.getAsync<SubscriptionYears>(query);
        this.currentSubscriptionYear = r.currentSubscriptionYear;
        this.subscriptionYears = r.subscriptionYears;
        this.subscriptionYearList = [];
        for (let y of this.subscriptionYears) {
            let item = new EnumValue();
            item.value = parseInt(y);
            item.name = y;
            this.subscriptionYearList.push(item);
        }
    }
    getSubscriptionYearList() {
        return new Promise<EnumValue[]>(async resolve => {
            if (!this.subscriptionYearList) {
                await this.getSubscriptionYears();
            }
            resolve(this.subscriptionYearList);
        });
    }
    getCurrentSubscriptionYear() {
        // console.log("getCurrentSubscriptionYear()");
        return new Promise<string>(async resolve => {
            if (!this.subscriptionYearList) {
                await this.getSubscriptionYears();
            }
            resolve(this.currentSubscriptionYear);
        });

    }
    async getZoneList() {
        let query = `get/zones`;
        //console.log(`${query}`);
        return new Promise<EnumValue[]>(async resolve => {
            if (!this.zones) {
                this.zoneList = [];
                this.zones = await this.getAsync<Zone[]>(query);
                for (let zone of this.zones) {
                    //console.log(`zone ${zone.number}, zonelist length = ${this.zoneList.length}`);
                    let val = new EnumValue();
                    val.value = zone.number;
                    val.name = `${zone.number} - ${zone.description}`
                    this.zoneList.push(val);
                    //console.log(`zone length = ${this.zones.length}, zonelist length = ${this.zoneList.length}`);
                }
            }
            resolve(this.zoneList)
        });
    }

    async getParametersV2() {
        let query = 'get/parameters/V2';
        return this.getAsync<Parameters>(query);
        //this.zones = pex.zones;
        //this.currentSubscriptionYear = pex.currentSubscriptionYear;
        //this.subscriptionYears = pex.subscriptionYears;
        //this.zoneList = [];
        //this.zones.forEach((z) => {
        //    this.zoneList.push(new EnumValue(z.number, `${z.number} - ${z.description}`));
        //});
        //let result = new Parameters();
        //result.showEmailAsMailToLink = pex.showEmailAsMailToLink;
        //return new Promise<Parameters>(resolve => resolve(result));
    }
    async getFilteredMembersV2(filters: ColumnMetadata[]) {
        let query = `post/members/V2`;
        return this.postAndGetAsync<string, Member[]>(query, JSON.stringify(filters));
    }
    async getFilteredMembersV2AsSheet(filters: ColumnMetadata[]) {
        let query = `post/members/V2/sheet`;
        return this.postAndGetAsync<string, string>(query, JSON.stringify(filters));
    }
    async getAddresses(zoneNumber: number) {
        let query = `get/addresses/${zoneNumber}`;
        return this.getAsync<EmailAddresses>(query);
    }
    async getAllAddresses() {
        let query = `get/addresses/all`;
        return this.getAsync<EmailAddresses>(query);
    }
    async downloadSheet(filters: ColumnMetadata[]) {
        let query = `post/members/V2/sheet`;
        let df = await this.postAndDownloadFileAsync(query, filters);
        this.saveFile(df.filename, df.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    async checkEmailInUse(email: string) {
        let query = `check/email/${email}`;
        return this.getAsync<boolean>(query);
    }
    async getMemberV2(id: number): Promise<Member> {
        let query = `get/member/V2/${id}`;
        return this.getAsync<Member>(query);
    }
    async getMemberNotesV2(memberId: number) {
        let query = `get/member/v2/${memberId}/notes`;
        return this.getAsync<Note[]>(query);
    }
    async getDocumentList() {
        let query = `get/documentlist`;
        return this.getAsync<DocumentInfo[]>(query);
    }
    async getChangeHistory() {
        let query = `get/history`;
        return this.getAsync<Change[]>(query);
    }
    async createNewMemberV2(member: Member) {
        let post = `post/new/member/v2`;
        return this.postAndGetAsync<Member, number>(post, member);
    }
    async updateMemberV2(member: Member) {
        let post = `post/update/member/v2`;
        return this.postAndGetAsync<Member, number>(post, member);
    }
    async deleteMemberV2(memberId: number) {
        let query = `delete/member/v2/${memberId}`;
        return this.getAsync(query);
    }
    async getStats() {
        let query = `get/stats/V2`;
        return this.getAsync<Statistics>(query);
    }
    async getMemberChangesV2(memberId: number) {
        let query = `get/member/v2/${memberId}/changes`;
        return this.getAsync<Change[]>(query);
    }
    async getMailchimpInformation() {
        let query = `get/info/mailchimp`;
        return this.getAsync<MailchimpInformation>(query);
    }
    async synchroniseMailchimp() {
        let query = `sync/mailchimp`;
        return this.getAsync(query);
    }
    //

    private getPaymentTypeDisplayName(pt: string): string {
        let r = pt;
        switch (pt) {
            case "BankTransfer":
                r = "Bank Transfer";
                break;
            case "StandingOrder":
                r = "Standing Order";
                break;
            case "NotKnown":
                r = "Not Known";
                break;
        }
        return r;
    }
}
