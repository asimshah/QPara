import { Component, OnInit, ViewChild } from '@angular/core';
import { PopupMessageComponent } from '../../fastnet/controls/popup-message.component';
import { StandardLists, EmailAddresses } from '../shared/common.types';
import { EnumValue } from '../../fastnet/core/core.types';
import { MembersService } from '../services/members.service';
import { AuthenticationService, UserType, UserProfile } from '../services/authentication.service';

@Component({
  selector: 'qp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @ViewChild(PopupMessageComponent, { static: false }) messageBox: PopupMessageComponent;
    StandardLists = StandardLists;
    zoneAddresses: EmailAddresses;
    allAddresses: EmailAddresses;
    UserType = UserType;
    zone: EnumValue;
    //_zoneNumber: number;
    get zoneNumber(): number {
        return  this.zone ? this.zone.value : 0;
    }
    //set zoneNumber(val: number) {
    //    if (val !== this._zoneNumber) {
    //        this._zoneNumber = val;
    //        this.onZoneNumberChanged();
    //    }
    //}
    zoneList: EnumValue[] = [];
    isReady: boolean = false;
    readonly user: UserProfile;
    constructor(private authenticationService: AuthenticationService, private memberService: MembersService, /*private dialogService: ModalDialogService*/) {
        console.log("DashboardComponent: constructor()");
        this.user = this.authenticationService.user;
    }
    async ngOnInit() {

        //await this.memberService.getParametersV2();
        this.zoneList = await this.memberService.getZoneList();

        if (this.user.type === UserType.StreetRepresentative) {
            this.zone = this.zoneList.find(x => x.value === this.user.zoneNumber);
            this.onZoneNumberChanged();
            //this.zoneNumber = this.zone.value;// this.user.zoneNumber;
        }
        this.isReady = true;
    }
    onSelectionChanged(item: EnumValue) {
        console.log(`item ${item.name}`);
        this.zone = item;
        this.onZoneNumberChanged();
        //this.zoneNumber = this.zone.value;
    }
    async copyAllMembers() {
        if (!this.allAddresses) {
            this.allAddresses = await this.memberService.getAllAddresses();
        }
        this.copyAddressesToClipboard(this.allAddresses.addressesForMembers);
        let msg = 'The requested list of email addresses has been copied. You can now paste this list into an application of your choice (such as Word, or Outlook, etc.)';
        this.messageBox.open(msg, () => { });
    }
    copyZoneMembers() {
        this.copyAddressesToClipboard(this.zoneAddresses.addressesForMembers);
        let msg = 'The requested list of email addresses has been copied. You can now paste this list into an application of your choice (such as Word, or Outlook, etc.)';
        this.messageBox.open(msg, () => { });
    }
    copyZonePaymentsOutstanding() {
        this.copyAddressesToClipboard(this.zoneAddresses.addressesForPaymentsOutstanding);
        let msg = 'The requested list of email addresses has been copied. You can now paste this list into an application of your choice (such as Word, or Outlook, etc.)';
        this.messageBox.open(msg, () => { });
    }
    copyZoneForMinutes() {
        this.copyAddressesToClipboard(this.zoneAddresses.addressesForMinutes);
        let msg = 'The requested list of email addresses has been copied. You can now paste this list into an application of your choice (such as Word, or Outlook, etc.)';
        this.messageBox.open(msg, () => { });

    }

    ToEmailAddressList(addresses: string[]): string {
        return addresses.join(';');
    }
    private async onZoneNumberChanged() {
        if (this.zoneNumber > 0) {
            this.zoneAddresses = await this.memberService.getAddresses(this.zoneNumber);
        }
    }
    private copyAddressesToClipboard(addresses: string[]): boolean {
        let text = "";
        if (addresses.length > 0) {
            text = addresses.join("\n");
        }
        //console.log(`${JSON.stringify(addresses)}, text is ${text}`);
        var txtArea = document.createElement("textarea");
        txtArea.id = 'txt';
        txtArea.style.position = 'fixed';
        txtArea.style.top = '0';
        txtArea.style.left = '0';
        txtArea.style.opacity = '0';
        txtArea.value = text;
        document.body.appendChild(txtArea);
        txtArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            if (successful) {
                return true;
            }
        } catch (err) {
            console.log('Oops, unable to copy');
        } finally {
            document.body.removeChild(txtArea);
        }
        return false;
    }
}
