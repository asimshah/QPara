import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input, Output, EventEmitter } from "@angular/core";
import { ControlBase, InputControlBase } from "./controlbase.type";

@Component({
    selector: 'text-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': isInError(), 'disabled' : disabled}" >
            <label [for]="controlId" >
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
            <input [id]="controlId" #focushere type="text" [placeholder]=placeHolderText [(ngModel)]="value" [ngStyle]="getStyle()" (blur)="onBlur()" (input)="onChange()"  />
            <div *ngIf="isInError()" class="validation-text">
                <span  class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./text-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => TextInputControl)
        }
    ]
})
export class TextInputControl extends InputControlBase {
    @Output() change = new EventEmitter();
    private _alignright: boolean;
    private _alignrightSet: boolean = false;
    private _noborder: boolean;
    private noborderSet: boolean = false;

    public get noborder() {
        return this._noborder;
    }
    @Input() public set noborder(val: boolean) {
        this.noborderSet = true;
        this._noborder = val;
    }
    public get alignright() {
        return this._alignright;
    }
    @Input() public set alignright(val : boolean) {
        this._alignrightSet = true;
        this._alignright = val;
    }
    constructor() {
        super();
        this.setReference("text");
        //console.log(`${this.getReference()} is TextInputControl`);
    }
    onChange() {
        super.onInput();
        this.change.emit();
    }
    getStyle() {
        let style = {};
        //console.log(`getStyle(): _alignright = ${this._alignright}, _alignrightSet = ${this._alignrightSet}`);
        if (this._alignrightSet === true) {
            style['text-align'] = 'right';
        }
        if (this.noborderSet === true) {
            style['border'] = 'none';
        }
        return style;
    }
}

