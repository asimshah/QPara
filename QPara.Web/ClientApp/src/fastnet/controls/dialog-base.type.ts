import { Input, ContentChildren, QueryList, ElementRef } from "@angular/core";
import { ControlBase } from "./controlbase.type";
import { ValidationResult, ValidationContext } from "./controls.types";

export class DialogValidationResult {
   control: ControlBase;
   validationResult: ValidationResult;
}
export class DialogBase {
   @Input() columns: number = 1;
   @ContentChildren(ControlBase) controls: QueryList<ControlBase>;
   constructor(protected componentElement: ElementRef) {

   }
   public isMobileDevice() {
      if (ControlBase.deviceSensitivity) {
         return matchMedia("only screen and (max-width: 760px)").matches;
      }
      return false;
   }
   isValid() {
      let controls = this.getDialogControls();
      //console.log(`isValid(): control count is ${controls.length}`);
      let r = true;
      for (let control of controls) {
         if (!control.isValid()) {
            r = false;
            break;
         }
      }
      return r;
   }
   /** @description validates all controls in this dialog by calling Validate() on each in turn
    * and returns false if there is any control that is invalid. Also sets focus to that control
    * OBSOLETE!!!!!!!!!
    */
   async validateAll() {
      let results = await this.validate();
      let r = results.length == 0; // true if there are no errors
      if (!r) {
         let c = results[0].control;
         c.focus();
      }
      return r;
   }
   /** @description validates all controls in this dialog by calling Validate() on each in turn
    * and returns an array of DialogValidationResult for each control that is invalid
    * OBSOLETE!!!!!!!!!
    */
   validate() {
      return new Promise<DialogValidationResult[]>(async resolve => {
         let results: DialogValidationResult[] = [];
         for (let control of this.controls.toArray()) {
            let vr = await control.validate(ValidationContext.DialogValidation);
            if (!vr.valid) {
               let dvr = new DialogValidationResult();
               dvr.control = control;
               dvr.validationResult = vr;
               results.push(dvr);
            }
         }
         resolve(results);
      });
   }
   reset() {
      for (let control of this.controls.toArray()) {
         control.reset();
      }
   }
   private getDialogControls(): ControlBase[] {
      let controls: ControlBase[] = [];
      function scan(rootElem: Element) {
         let children = rootElem.children;
         for (let i = 0; i < children.length; ++i) {
            let elem = children.item(i);
            if ((<any>elem).fastnetComponent) {
               controls.push((<any>elem).fastnetComponent);
            }
            scan(elem);
         }
      }
      scan(this.componentElement.nativeElement);
      return controls;
   }
}
