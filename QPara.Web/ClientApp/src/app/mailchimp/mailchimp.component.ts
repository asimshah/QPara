import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MembersService } from '../services/members.service';
import { MailchimpInformation } from '../shared/common.types';
import '../shared/common.functions';
import { BusyIndicatorComponent } from '../../fastnet/controls/busy-indicator.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageCloseHandler } from '../../fastnet/controls/popup-message.component';
import { DialogResult } from '../../fastnet/core/core.types';

@Component({
    selector: 'app-mailchimp',
    templateUrl: './mailchimp.component.html',
    styleUrls: ['./mailchimp.component.scss']
})
export class MailchimpComponent implements AfterViewInit {
    @ViewChild(PopupMessageComponent, { static: false }) messageBox: PopupMessageComponent;
    @ViewChild(BusyIndicatorComponent, { static: false }) busyIndicator: BusyIndicatorComponent;
    public ready = false;
    public info: MailchimpInformation;
    public addressesInMailchimpNotInMembers: string[] = [];
    public addressesInMembersNotInMailchimp: string[] = [];
    constructor(private membersService: MembersService) { }
    ngAfterViewInit() {
        setTimeout(async () => { 
            //this.busyIndicator.busy = true;
            //this.info = await this.membersService.getMailchimpInformation();
            //this.setMutuallyExcluded();
            //this.ready = true;
            //this.busyIndicator.busy = false;
            await this.initialise();
        }, 0);
    }
    public Synchronise() {       
        let options = new PopupMessageOptions();
        options.allowCancel = true;
        let message = `Mailchimp addresses will be updated to match current membership data. This process will take a while and is irreversible. Press OK to continue, otherwise Cancel`;
        this.messageBox.open(message, async (dr) => {
            if (dr === DialogResult.ok) {
                this.busyIndicator.busy = true;
                await this.membersService.synchroniseMailchimp();
                this.busyIndicator.busy = false;
                await this.initialise();
            }
        }, options);

    }
    private async initialise() {
        this.ready = false;
        this.busyIndicator.busy = true;
        this.info = await this.membersService.getMailchimpInformation();
        this.setMutuallyExcluded();
        this.busyIndicator.busy = false;
        this.ready = true;
    }
    private setMutuallyExcluded() {
        let subscribed = new Set(this.info.subscribed.map(x => x.emailAddress));
        let receivingMembers = new Set(this.info.membersReceivingEmail);
        //let diff = this.except(subscribed, receivingMembers);
        this.addressesInMailchimpNotInMembers = [...this.except(subscribed, receivingMembers)];
        this.addressesInMembersNotInMailchimp = [...this.except(receivingMembers, subscribed)]
        //return [...diff];
    }
    //private getAddressesInMembersNotInMailchimp() {
    //    let subscribed = new Set(this.info.subscribed.map(x => x.emailAddress));
    //    let receivingMembers = new Set(this.info.membersReceivingEmail);
    //    let diff = this.except(receivingMembers, subscribed);
    //    return [...diff];
    //}
    private intersection<T>(setA: Set<T>, setB: Set<T>) {
        return new Set([...setA].filter(x => setB.has(x)));
    }

    private union<T>(setA: Set<T>, setB: Set<T>) {
        return new Set<T>([...setA, ...setB]);
    }
    private except<T>(setA: Set<T>, setB: Set<T>) {
        //let setA = this as Set;
        return new Set([...setA].filter(x => !setB.has(x)));
    }
}


