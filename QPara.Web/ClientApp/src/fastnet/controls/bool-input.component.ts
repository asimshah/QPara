import { Component, forwardRef, EventEmitter, Output, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controlbase.type";
import { InputControlBase } from "./inputcontrolbase";

@Component({
    selector: 'bool-input',
    template: `<div class="bool-input" [ngClass]="{'disabled' : disabled}" >
            <label>                
            <input #focushere type="checkbox" [(ngModel)]="value" (blur)="onBlur()" (change)="onChange()"/>
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
        </div>`,
    styleUrls: ['./bool-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => BoolInputControl)
        }
    ]
})
export class BoolInputControl extends InputControlBase {
    @Output() change = new EventEmitter();
   constructor(elem: ElementRef) {
        super(elem);
        this.setReference("bool");
    }
    onChange() {
        this.change.emit();
    }
}
