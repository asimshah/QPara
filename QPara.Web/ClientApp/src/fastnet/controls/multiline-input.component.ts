import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input } from "@angular/core";
//import { TextInputControl } from "./text-input.component";
import { InputControlBase, ControlBase } from "./controlbase.type";

export enum Resizability {
    HorizontalOnly,
    VerticalOnly,
    None,
    Both,
}


@Component({
    selector: 'multiline-input',
    template: `<div class="multiline-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label>  
                <span [innerHTML]="label"></span>
            <textarea #focushere type="text" [(ngModel)]="value" [rows]=rows  (blur)="onBlur()" [ngClass]="getResizeClass()"></textarea>
            </label>
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./multiline-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultilineTextInput),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => MultilineTextInput)
        }
    ]
})
export class MultilineTextInput extends InputControlBase {
    @Input() rows: number;
    @Input('resize') resizability: Resizability;
    constructor() {
        super();
        this.setReference("multi-line");
    }
    getResizeClass(): string {
        let r = "resize-both";
        if (this.resizability) {
            switch (+this.resizability!) {
                case Resizability.Both:
                    r = "resize-both";
                    break;
                case Resizability.VerticalOnly:
                    r = "resize-vertical";
                    break;
                case Resizability.HorizontalOnly:
                    r = "resize-horizontal";
                    break;
                case Resizability.None:
                    r = "resize-none";
                    break;
            }
        }
        return r;
    }
}