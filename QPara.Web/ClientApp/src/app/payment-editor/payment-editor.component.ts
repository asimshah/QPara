import { Component, ViewChild, AfterViewInit, OnInit, ViewChildren, QueryList } from "@angular/core";
import { PopupDialogComponent } from "../../fastnet/controls/popup-dialog.component";
import { DialogResult, EnumValue, ListItem } from "../../fastnet/core/core.types";
import { Payment, PaymentType, Note, NoteLine } from "../shared/common.types";

import { ValidationResult, ValidationContext } from "../../fastnet/controls/controls.types";
import { ValidationMethod } from "../../fastnet/controls/controlbase.type";
//import { Dictionary } from "../types/dictionary.types";
//import { NoteEditorComponent } from "./note-editor.component";
import { getCleanDate, getFormattedDate } from "../shared/common.functions";
import { MembersService } from "../services/members.service";
import { UserProfile, AuthenticationService } from "../services/authentication.service";
import { NoteEditorComponent } from "../note-editor/note-editor.component";
import { Dictionary } from "../../fastnet/core/dictionary.types";
import { DateInputControl } from "../../fastnet/controls/date-input.component";
//import { MembersService, UserProfile } from "../shared/members.service";

export class PaymentEditorResult {
  cancelled: boolean = false;
  payment: Payment;
}


@Component({
  selector: 'qp-payment-editor',
  templateUrl: './payment-editor.component.html',
  styleUrls: ['./payment-editor.component.scss']
})
export class PaymentEditorComponent implements OnInit, AfterViewInit {
  @ViewChild(PopupDialogComponent, { static: false }) popup: PopupDialogComponent;
  @ViewChild(NoteEditorComponent, { static: false }) noteEditor: NoteEditorComponent;
  //@ViewChildren(DateInputControl) datesInputs: QueryList<DateInputControl>;
 // @ViewChild('recdon', { static: false }) dateInputControl: DateInputControl;
  //commands = commands;
  PaymentType = PaymentType;
  subscriptionYearList: ListItem<number>[];
  payment: Payment;
  public validators: Dictionary<ValidationMethod>;
  private isNew: boolean = false;
  private logValidations = false;
  private user: UserProfile;
  private originalJson: string;
  //private dates: DateInputControl[] = [];
  constructor(private authenticationService: AuthenticationService, private memberService: MembersService) { }
  async ngOnInit() {
    await this.initialise();
  }
  ngAfterViewInit() {
    //this.dates = this.datesInputs.toArray();
    //debugger;
  }
  async open(payment: Payment | null, onClose: (r: PaymentEditorResult) => void) {
    //console.log("on open()");
    //this.dateInputControl.reset();
    if (payment === null) {
      this.payment = new Payment();
      this.payment.subscriptionYear = await this.memberService.getCurrentSubscriptionYear();
      this.payment.id = 0;
      this.payment.type = PaymentType.Cash;
      this.payment.notes = [];
      this.isNew = true;
    } else {
      //console.log(`existing payment`);
      this.payment = payment;
    }
    this.payment.subscriptionYearItem = this.getSubscriptionYear(this.payment.subscriptionYear);
    this.originalJson = JSON.stringify(this.payment);
    this.addvalidators();
    this.subscriptionYearList = await this.memberService.getSubscriptionYearList();
    this.popup.width = 700;
    this.popup.open((r: PaymentEditorResult) => {
      this.payment.subscriptionYearItem = undefined; // so this does not create "pending changes"
      onClose(r);
    });
  }
  hasChanged(): boolean {
    let json = JSON.stringify(this.payment);
    return json !== this.originalJson;
  }
  onClose() {

  }
  onCancel() {
    let r = new PaymentEditorResult();
    r.cancelled = true;
    this.popup.close(r);
  }
  async onSave() {
    console.log("on Save");
    if (await this.popup.isValid()) {
      let r = new PaymentEditorResult();
      this.payment.subscriptionYear = this.payment.subscriptionYearItem!.name;
      r.payment = this.payment;
      this.popup.close(r);
    }
  }
  onAddNote() {
    this.noteEditor.open((r) => {
      if (r.cancelled) {

      } else {
        let note = new Note();
        note.id = 0;
        note.createdOn = getCleanDate(null);
        note.userName = this.user.name;
        note.formattedCreatedOn = getFormattedDate(note.createdOn);
        note.noteLines = [];
        let index = 0;
        for (let line of r.text.split('\n')) {
          let nl = new NoteLine();
          nl.index = index++;
          nl.line = line;
          note.noteLines.push(nl);
        }
        this.payment.notes.splice(0, 0, note);
      }
    });
  }

  private async initialise() {
    this.user = this.authenticationService.user;// this.memberService.getCurrentUserProfile();
    //await this.memberService.getParametersV2();
    this.subscriptionYearList = await this.memberService.getSubscriptionYearList();
  }
  private getSubscriptionYear(year: string): ListItem<number> {
    let yearNumber = parseInt(year);
    let r = this.subscriptionYearList.find(x => x.value === yearNumber);
    if (r === undefined) {
      debugger;
    }
    return r!;
  }
  private addvalidators() {
    this.validators = new Dictionary<ValidationMethod>();
    this.validators.add("recdOn", (vc, v) => {
      this.logValidationField("recdOn");
      return this.receivedOnRequiredRequiredValidatorAsync(vc, v);
    });
  }
  private logValidationField(fieldName: string) {
    if (this.logValidations) {
      console.log(`validating field ${fieldName}`);
    }
  }
  private receivedOnRequiredRequiredValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      //let vr = cs.validationResult;
      //let text = cs.value || "";
      let vr = new ValidationResult();
      let text = val || "";
      if (text.length === 0) {
        vr.valid = false;
        vr.message = `a Received Date is required`;
      }
      //resolve(cs.validationResult);
      resolve(vr);
    });
  }
}
