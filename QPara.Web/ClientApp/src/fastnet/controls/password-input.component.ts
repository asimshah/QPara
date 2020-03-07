import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Component, forwardRef, EventEmitter, Output } from "@angular/core";
import { ControlBase, InputControlBase } from "./controlbase.type";

@Component({
    selector: 'password-input',
    template: `<div class="password-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label [for]="controlId">
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
            <input [id]="controlId" #focushere type="password" [placeholder]=placeHolderText [(ngModel)]="value" (blur)="onBlur()" (input)="onChange()" />
            <div class="validation-text">
                <span *ngIf="isInError()" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./password-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PasswordInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => PasswordInputControl)
        }
    ]
})
export class PasswordInputControl extends InputControlBase {
    @Output() change = new EventEmitter();
    constructor() {
        super();
        this.setReference("password");
    }
    onChange() {
        super.onInput();
        this.change.emit();
    }
}
