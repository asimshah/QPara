import { Input, ContentChildren, QueryList } from "@angular/core";
import { ControlBase } from "./controlbase.type";
import { ValidationResult, ValidationContext } from "./controls.types";

/*
 * Only includes failed controls
 * 
 */ 
export class DialogValidationResult {
    control: ControlBase;
    validationResult: ValidationResult;
}
export class DialogBase {
    @Input() columns: number = 1;
    @ContentChildren(ControlBase) controls: QueryList<ControlBase>;

    async isValid() {
        let results = await this.validate();
        let somethingIsInvalid = results.some(x => x.validationResult.valid === false);
        console.log(`isValid() returns ${!somethingIsInvalid}`);
        return !somethingIsInvalid;
    }
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
            control.resetValidation();
        }
    }
}