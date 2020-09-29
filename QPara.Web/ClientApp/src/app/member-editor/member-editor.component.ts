import { Component, OnInit, OnDestroy, ViewChildren, QueryList, HostListener, AfterViewInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ControlBase, ValidationMethod } from "../../fastnet/controls/controlbase.type";
import { ValidationResult, ValidationContext } from "../../fastnet/controls/controls.types";

import { getCleanDate, getFormattedDate } from "../shared/common.functions";
import { Location } from "@angular/common";

import { PopupDialogComponent } from "../../fastnet/controls/popup-dialog.component";
import { PopupMessageComponent } from "../../fastnet/controls/popup-message.component";
import { EnumValue, DialogResult } from "../../fastnet/core/core.types";
import { NoteEditorComponent } from "../note-editor/note-editor.component";
import { PaymentEditorComponent, PaymentEditorResult } from "../payment-editor/payment-editor.component";
import { UserType, UserProfile, AuthenticationService } from "../services/authentication.service";
import { SubscriptionPeriod, SubscriptionType, PaymentMethod, MinutesDeliveryMethod, LeavingReasons, Member, MemberEditResult, Payment, PaymentType, Note, NoteLine } from "../shared/common.types";
import { Subject, Observable } from "rxjs";
import { Dictionary } from "../../fastnet/core/dictionary.types";
import { MembersService } from "../services/members.service";
import { environment } from "../../environments/environment";


enum commands {
  close,
  deleteMember,
  saveChanges,
  cancelChanges,
  createNewMember,
  addPayment,
  cancelNewMember,
  addMemberNote
}
enum tabIds {
  nameAddress,
  subscription,
  payments,
  memberNotes,
  history
}
class noteEditingModel {
  isMemberNote: boolean; // else it is a payment note
  note: string;
}
class tab {
  id: tabIds;
  caption: string;
  //selected: boolean
}

@Component({
  selector: 'qp-edit-member',
  templateUrl: './member-editor.component.html',
  styleUrls: ['./member-editor.component.scss']
})
export class MemberEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PopupDialogComponent, { static: false }) popup: PopupDialogComponent;
  @ViewChild(NoteEditorComponent, { static: false }) noteEditor: NoteEditorComponent;
  @ViewChild(PaymentEditorComponent, { static: false }) paymentEditor: PaymentEditorComponent;
  @ViewChild(PopupMessageComponent, { static: false }) messageBox: PopupMessageComponent;
  @ViewChildren(ControlBase) controls: QueryList<ControlBase>;

  listItems: any[] = [];


  tabIds = tabIds;
  commands = commands;
  UserType = UserType;
  SubscriptionPeriod = SubscriptionPeriod;
  SubscriptionType = SubscriptionType;
  PaymentMethod = PaymentMethod;
  MinutesDeliveryMethod = MinutesDeliveryMethod;
  LeavingReasons = LeavingReasons;
  private static newMemberCreatedSource = new Subject<number>();
  static newMemberCreated$ = MemberEditorComponent.newMemberCreatedSource.asObservable();
  readonly user: UserProfile;
  zoneList: EnumValue[];
  public validators: Dictionary<ValidationMethod>;
  tabs: tab[];
  selectedTab: tab;
  memberId: number;
  member: Member;
  currentSubscriptionYear: string;
  private originalMemberInformation: string; // for change detection
  private logValidations = false;
  private editResult: MemberEditResult;
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private memberService: MembersService
  ) {
    if (environment.production === false) {
      console.log("MemberEditorComponent constructor()");
    }
    this.buildtabs();
    this.user = this.authenticationService.user;// this.memberService.getCurrentUserProfile();
  }
  ngOnDestroy() {

  }
  async ngOnInit() {

  }
  ngAfterViewInit(): void {

  }
  async open(member: Member | null, onClose: (r: MemberEditResult) => void) {
    this.selectedTab = this.tabs[0];
    if (member) {
      this.memberId = member.id;
    } else {
      this.memberId = 0;
    }

    await this.initialiseAllStaticData();
    await this.initialiseMember();
    this.popup.open((r: MemberEditResult) => {
      r.member = this.member;
      onClose(r);
    });
  }
  onClose() {
    //let result = new MemberEditResult();
    //this.editResult.cancelled = true;
    this.popup.close(this.editResult);
  }
  onCancel() {
    //let result = new MemberEditResult();
    this.editResult.cancelled = true;
    this.popup.close(this.editResult);
  }
  async onTabClick(t: tab) {
    let r = await this.validateAll();
    console.log(`onTabClick(): ${t.caption}, r = ${r}`);
    if (r) {
      let r = await this.canProceed();
      if (r) {
        let previousTab = this.selectedTab;
        this.selectedTab = t;
      }
    }
  }
  async onCancelChanges() {
    await this.initialiseMember();
  }
  async onAddNewMemberNote() {
    this.noteEditor.open((r) => {
      if (r.cancelled) {

      } else {
        this.addNewMemberNote(r.text);
      }
    });
  }
  async onCreateNewPayment() {

    this.paymentEditor.open(null, (r: PaymentEditorResult) => {
      if (!r.cancelled) {
        this.member.payments.splice(0, 0, r.payment);
      }
    });
  }
  onEditPayment(payment: Payment, index: number) {
    if (index < 3) {
      this.paymentEditor.open(payment, (r: PaymentEditorResult) => {
        //if (r.cancelled) {

        //}
      });
    } else {
      this.messageBox.open("This payment can no longer be edited", () => { });
    }
  }
  async onCreateNewMember() {
    let r = await this.validateAll();
    if (r) {
      this.member.zoneNumber = this.member.zoneItem.value;
      this.member.isAssociate = this.member.zoneNumber === 19;
      console.log(`creating new member using ${JSON.stringify(this.member)}`);
      this.member.id = await this.memberService.createNewMemberV2(this.member);
      this.memberId = this.member.id;
      this.saveMemberInformation();
      MemberEditorComponent.newMemberCreatedSource.next(this.member.id);
      this.messageBox.open("A new member has been created", () => { })
    } else {
      console.log("some controls are not valid")
    }
  }
  async onUpdateMember() {
    console.log(`updating member using ${JSON.stringify(this.member)}`);
    let r = await this.validateAll();
    if (r) {
      console.log("all valid");
      this.member.zoneNumber = this.member.zoneItem.value;
      this.member.isAssociate = this.member.zoneNumber === 19;
      await this.memberService.updateMemberV2(this.member);
      await this.getMember();
      this.saveMemberInformation();
      this.editResult.memberChanged = true;
      this.messageBox.open("Member details have been saved.", () => { })
    } else {
      console.log("some controls are not valid")
    }
  }
  onDeleteMember() {
    let messages = [];
    messages.push('<div>Deleting a member will permanently remove all information about the member including from "Joiners and Leavers Analysis". An alternative might be to suspend the member.</div>');
    messages.push('<div>Please confirm that it is OK to delete this member.</div>');
    this.messageBox.open(messages, async (r) => {
      if (r === DialogResult.ok) {
        await this.memberService.deleteMemberV2(this.memberId);
        //let result = new MemberEditResult();
        this.editResult.memberDeleted = true;
        //result.member = this.member;
        this.popup.close(this.editResult);
      }
    }, { allowCancel: true });
    //alert("message-box confirm-delete");
  }
  isNewMember(): boolean {
    return !this.member || this.member && this.member.id === 0;
  }
  getCurrentMemberHeading(): string {
    if (this.member) {
      let fn = this.member.firstName || "";
      let ln = this.member.lastName || "";
      if (fn.trim().length > 0 || ln.trim().length > 0) {
        return `${fn} ${ln}`;
      }
      if (this.isNewMember()) {
        return "(new member)";
      }
    }
    return "";
  }
  canShowButton(cmd: commands) {
    let r = false;
    if (this.user !== null) {
      switch (cmd) {
        case commands.close:
          r = this.isNewMember() === false && !this.memberHasChanged();
          break;
        case commands.deleteMember:
          r = this.user.type === UserType.Administrator && !this.isNewMember();
          break;
        case commands.saveChanges:
        case commands.cancelChanges:
          r = !this.isNewMember() && this.memberHasChanged();
          break;
        case commands.createNewMember:
        case commands.cancelNewMember:
          r = this.isNewMember();
          break;
        case commands.addPayment:
          r = this.user.type === UserType.Administrator && this.selectedTab.id === tabIds.payments;
          break;
        case commands.addMemberNote:
          r = this.selectedTab.id === tabIds.memberNotes;
          break;
      }
    }
    return r;
  }
  enableLeavingReasons(): boolean {
    return this.member.leftOn !== null;
  }
  async initialiseMember() {
    if (this.memberId > 0) {
      await this.getMember();

    } else {
      this.member = new Member();
      this.member.id = 0;
      this.member.firstName = "";
      this.member.lastName = "";

      this.member.memberCount = 1;
      this.member.subscriptionPeriod = SubscriptionPeriod.Annual;
      this.member.subscriptionType = SubscriptionType.Standard;
      this.member.minutesDeliveryMethod = MinutesDeliveryMethod.ByEmail;
      this.member.joinedOn = getCleanDate(null);
      this.member.notes = [];
      this.member.paymentMethod = PaymentMethod.OneOff;
      this.member.payments = [];
      this.member.isSuspended = false;
      this.member.flat = "";
      this.member.address = "";
      this.member.postCode = "";
      this.member.email = "";
      this.member.secondEmail = "";
      this.member.mobileNumber = "";
      this.member.phoneNumber = "";
      this.member.zoneNumber = 19;
    }
    //console.log(`zone list length = ${this.zoneList.length}`);
    this.member.zoneItem = this.zoneList.find(x => x.value === this.member.zoneNumber)!;
    //console.log(`zone item is ${this.member.zoneItem.value}`);
    this.saveMemberInformation();
    this.editResult = new MemberEditResult();
  }
  async getMember() {
    this.member = await this.memberService.getMemberV2(this.memberId);
    this.ensureMemberDates(this.member);
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
  getPaymentStatement(): string {
    if (this.member.subscriptionPeriod === SubscriptionPeriod.Life) {
      return "Life Member";
    } else {
      if (this.member.amountDue <= this.member.amountReceived) {
        return `Fully paid: due amount £${this.member.amountDue}, received £${this.member.amountReceived}`;
      } else {
        if (this.member.paymentIsOutstanding) {
          return `Payment is outstanding: due amount £${this.member.amountDue}, received £${this.member.amountReceived}`;
        } else {
          return `Payment has been waived: due amount £${this.member.amountDue}, received £${this.member.amountReceived}`;
        }
      }
    }
  }
  formatDate(d: Date | string): string {
    return getFormattedDate(d);
  }
  getToday(): Date {
    let td = new Date();
    return new Date(Date.UTC(td.getFullYear(), td.getMonth(), td.getDate()));
  }
  memberHasChanged(): boolean {
    let memberInfo = JSON.stringify(this.member);
    let r = memberInfo !== this.originalMemberInformation;

    return r;
  }
  async validateAll(): Promise<boolean> {
    let results = await this.popup.validate();

    let r = results.length == 0;
    if (!r) {
      let c = results[0].control;
      c.focus();
    }

    return r;
  }
  @HostListener('window:beforeunload')
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.memberHasChanged()) {

        this.messageBox.open("There are changes that you have made that have not been saved. Please confirm that it is OK to discard these changes.", (r) => {
          if (r === DialogResult.ok) {
            resolve(true);
          } else {
            resolve(false);
          }
        });

      } else {
        resolve(true);
      }
    });
  }
  private canProceed(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.memberHasChanged() === true) {
        this.messageBox.open("Save current changes first, before moving to a new tab", () => { resolve(false) });
      } else {
        resolve(true);
      }
    });

  }
  private addNewMemberNote(text: string) {
    let note = new Note();
    note.id = 0;
    note.createdOn = getCleanDate(null);
    note.userName = this.user.name;
    note.formattedCreatedOn = getFormattedDate(note.createdOn);
    note.noteLines = [];
    let index = 0;
    for (let line of text.split('\n')) {
      let nl = new NoteLine();
      nl.index = index++;
      nl.line = line;
      note.noteLines.push(nl);
    }

    this.member.notes.splice(0, 0, note);
  }
  private async initialiseAllStaticData() {
    this.addValidators();
    this.currentSubscriptionYear = await this.memberService.getCurrentSubscriptionYear();
    await this.memberService.getParametersV2(); // called here again because you might jump straight in here without going through app ngInit() (but how does that happen???)
    this.zoneList = await this.memberService.getZoneList();
  }
  private buildtabs() {
    this.tabs = [];
    this.tabs.push({ id: tabIds.nameAddress, caption: "Name &amp; Address" });
    this.tabs.push({ id: tabIds.subscription, caption: "Subscription Details" });
    this.tabs.push({ id: tabIds.payments, caption: "Payments" });
    this.tabs.push({ id: tabIds.memberNotes, caption: "Member Notes" });
    this.tabs.push({ id: tabIds.history, caption: "Change History" });
    this.selectedTab = this.tabs[0];
  }
  private logValidationField(fieldName: string) {
    if (this.logValidations) {
      console.log(`validating field ${fieldName}`);
    }
  }
  private addValidators() {
    this.validators = new Dictionary<ValidationMethod>();

    this.validators.add("firstName", (vc, v) => {
      this.logValidationField("firstName");
      return this.firstNameValidatorAsync(vc, v);
    });
    this.validators.add("lastName", (vc, v) => {
      this.logValidationField("lastName");
      return this.lastNameValidatorAsync(vc, v);
    });
    this.validators.add("email", (vc, v) => {
      this.logValidationField("email");
      return this.emailValidatorAsync(vc, v);
    });
    this.validators.add("secondEmail", (vc, v) => {
      this.logValidationField("secondEmail");
      return this.emailValidatorAsync(vc, v);
    });

    this.validators.add("leftOn", (vc, v) => {
      this.logValidationField("recdOn");
      return this.leftOnValidatorAsync(vc, v);
    });
    this.validators.add("joinedOn", (vc, v) => {
      this.logValidationField("joinedOn");
      return this.joinedOnValidatorAsync(vc, v);
    });
    this.validators.add("mobile", (vc, v) => {
      this.logValidationField("mobile");
      return this.phoneNumberValidatorAsync(vc, v);
    });
    this.validators.add("phone", (vc, v) => {
      this.logValidationField("phone");
      return this.phoneNumberValidatorAsync(vc, v);
    });
  }
  //private firstNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
  private firstNameValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      //let vr = cs.validationResult;
      //let text = cs.value || "";
      let vr = new ValidationResult();
      let text = <string>val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `a First Name is required`;
      }
      //resolve(cs.validationResult);
      resolve(vr);
    });
  }
  //private lastNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
  private lastNameValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      //let vr = cs.validationResult;
      //let text = cs.value || "";
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `a Last Name is required`;
      }
      //resolve(cs.validationResult);
      resolve(vr);
    });
  }
  //private emailValidatorAsync(cs: ControlState): Promise<ValidationResult> {
  private emailValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>(async (resolve) => {
      //console.log(`email validation`);
      //let vr = cs.validationResult;
      //let text = cs.value || "";
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length > 0 && vr.valid) {
        if (this.member.id == 0 || !this.isCurrentEmail(text)) {
          let r = await this.memberService.checkEmailInUse(text);
          if (r === true) {
            vr.valid = false;
            vr.message = `this email is already in use`;
          }
        }
      }
      //resolve(cs.validationResult);
      resolve(vr);
    });
  }
  private addressValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    //console.log(`addressValidatorAsync: ${JSON.stringify(cs)}`);
    return new Promise<ValidationResult>((resolve) => {
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `an Address is required`;
      }
      resolve(vr);
    });
  }
  private postCodeValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `a Post Code is required`;
      }
      resolve(vr);
    });
  }
  private receivedOnRequiredRequiredValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `a Received Date is required`;
      }
      resolve(vr);
    });
  }
  private joinedOnValidatorAsync(cs: ValidationContext, val: Date): Promise<ValidationResult> {
    return new Promise<ValidationResult>(resolve => {
      let vr = new ValidationResult();
      let d: Date = val;
      if (d && d !== null) {
        let year = d.getFullYear();
        if (year < 2009) {
          vr.valid = false;
          vr.message = `the Joined On date cannot be so long ago`;
        }
      }
      resolve(vr);
    });
  }
  private leftOnValidatorAsync(cs: ValidationContext, val: Date): Promise<ValidationResult> {
    return new Promise<ValidationResult>(resolve => {
      let vr = new ValidationResult();
      if (val) {
        let d: Date = val;
        if (this.member && d !== null) {
          if (this.member.joinedOn == null) {
            let year = d.getFullYear();
            if (year < 2009) {
              vr.valid = false;
              vr.message = `the Left On date cannot be so long ago`;
            }
          } else {
            if (d.getTime() < this.member.joinedOn.getTime()) {
              vr.valid = false;
              vr.message = `the Left On date cannot be before the Joined On date`;
            }
          }
        }
      }
      resolve(vr);
    });
  }
  private phoneNumberValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length > 0) {
        let r = /^\d+/.test(text);
        if (!r) {
          vr.valid = false;
          vr.message = `a phone number can only contain digits`;
        }
      }
      resolve(vr);
    });
  }
  private isCurrentEmail(email: string): boolean {
    email = email.toLowerCase();
    let original = JSON.parse(this.originalMemberInformation) as Member;
    let em1 = original.email || "";
    let em2 = original.secondEmail || "";
    return email === em1.toLowerCase() || email === em2.toLowerCase();
  }
  private saveMemberInformation() {
    this.originalMemberInformation = JSON.stringify(this.member);
  }
  private resetMemberInformation() {
    this.member = JSON.parse(this.originalMemberInformation);
  }
  private ensureMemberDates(m: Member) {
    m.joinedOn = this.ensureDate(m.joinedOn);
    m.leftOn = this.ensureDate(m.leftOn);
    for (let p of m.payments) {
      p.receivedDate = this.ensureDate(p.receivedDate);
    }
  }
  private ensureDate(d: string | Date | null): Date | null {
    if (typeof d === "string") {
      return new Date(d);
    }
    return d;
  }
  //
}
