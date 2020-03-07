import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input, EventEmitter, Output } from "@angular/core";
import {  ValidationResult, ValidationContext } from "./controls.types";
import { ControlBase, InputControlBase } from "./controlbase.type";
import { isNullorUndefined, isWhitespaceOrEmpty } from "../core/common.functions";


@Component({
    selector: 'email-input',
    template: `<div class="email-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label [for]="controlId">
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
            <input [id]="controlId" #focushere type="email" [(ngModel)]="value" (blur)="onBlur()" (input)="onChange()"  />
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./email-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmailInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => EmailInputControl)
        }
    ]
})
export class EmailInputControl extends InputControlBase {
   //private defaultEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   private defaultEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;// this one allows longer tlds
    @Output() change = new EventEmitter();
    constructor() {
        super();
        this.setReference("email");
        this.setPrevalidator((ctx, val) => this.validateEmail(ctx, val));
    }
    onChange() {
        console.log("EmailInputControl ");
        super.onInput();
        this.change.emit();
    }
    private validateEmail(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (!isNullorUndefined(value) && !isWhitespaceOrEmpty(value)) {
                let text = value as string;
                if (text.length > 0) {
                    if (!this.defaultEmailPattern.test(text)) {
                        vr.valid = false;
                        vr.message = "This is not a valid email address";
                    }
                }
            }
            resolve(vr);
        });
    }
}
