import { Component, Input, forwardRef, ViewChild, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
//import { ControlBase } from "./controls.component";
//import { TextInputControl } from "./text-input.component";
import { ValidationResult, ValidationContext } from "./controls.types";
import { InputControlBase, ControlBase } from "./controlbase.type";
import { isNullorUndefined } from "../core/common.functions";


@Component({
    selector: 'number-input',
    template: `<div class="number-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label  [for]="controlId" [ngClass]="{'hide': !label || label.trim().length === 0}" >
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
            <input [id]="controlId" #focushere type="number" [(ngModel)]=value [min]=minNumber [max]=maxNumber (blur)="onBlur()" />

            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./number-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NumberInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => NumberInputControl)
        }
    ]
})
export class NumberInputControl extends InputControlBase {
    @Input() minNumber: number;
    @Input() maxNumber: number;
    @ViewChild('focushere', { static: false }) element: ElementRef;
    constructor() {
        super();
        this.setReference("number");
        this.setPrevalidator((ctx, val) => this.validateNumberAsync(ctx, val));
    }
    private validateNumberAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let nativeValue = this.element.nativeElement.value;
            //console.log(`value is ${value}, element value is ${nativeValue} (${typeof nativeValue})`);
            if (nativeValue.length === 0) {
                this.element.nativeElement.value = +value;
            }
            let vr = new ValidationResult();
            if (!isNullorUndefined(value)) {
                if (value !== NaN) {
                    let n: number = value;
                    if (this.minNumber && n < this.minNumber) {
                        vr.valid = false;
                        vr.message = "This number is too small";
                    } else if (this.maxNumber && n > this.maxNumber) {
                        vr.valid = false;
                        vr.message = "This number is too large";
                    }
                } else {
                    //console.log(`value is NaN`);
                }
            }
            resolve(vr);
        });
    }
}
//    private validateNumberAsyncOld(context: ValidationContext, value: any): Promise<ValidationResult> {
//        return new Promise<ValidationResult>((resolve) => {
//            console.log(`value is ${value}`);
//            let vr = new ValidationResult();
//            if (!isNullorUndefined(value)) {
//                if (value !== NaN) {
//                    let n: number = value;
//                    if (this.minNumber && n < this.minNumber) {
//                        vr.valid = false;
//                        vr.message = "This number is too small";
//                    } else if (this.maxNumber && n > this.maxNumber) {
//                        vr.valid = false;
//                        vr.message = "This number is too large";
//                    } else {
//                        console.log(`value is NaN`);
//                    }
//                }

//            }//);
//            resolve(vr));
//        }
//    }
//}
