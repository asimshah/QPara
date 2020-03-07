import { Component, forwardRef, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { InputControlBase } from "./controlbase.type";

@Component({
    selector: 'dropdown-input',
    template: `<div class="dropdown-input"  [ngClass]="{'disabled' : disabled}">
            <label [for]="controlId" *ngIf="label">
                <span [innerHTML]="label"></span>
                <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
            </label>
            <div class="dropdown-border">
                <select [id]="controlId" #focushere [(ngModel)]="value" (ngModelChange)="modelChange($event)" [size]="getSize()" (focus)="onSelectFocus()" (blur)="onSelectBlur()"  >
                    <option *ngFor="let item of items" [label]="getDisplayProperty(item)" [ngValue]="item" [attr.selected]="selectedItem(item)"></option>
                </select>
            </div>
        </div>`,
    styleUrls: ['./dropdown-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropDownControl),
            multi: true
        }
    ],
})
/**
 * be sure to assign [(ngModel)] to one of the instances in the [items] array
 */
export class DropDownControl extends InputControlBase {
    @Input() displayproperty: string = "name";
    @Input() items: any[] = [];
    @Output() selectionChanged = new EventEmitter<any>();
    @Input() showItemCount: number = 1;
    @Input() keepOpen: boolean = false;
    private inFocus: boolean = false;
    constructor() {
        super();
        this.setReference("dropdown");
    }
    onSelectFocus() {
        this.inFocus = true;
    }
    onSelectBlur() {
        this.inFocus = false;
    }
    modelChange(val: any) {
        console.log("model change");
        //this.value = val;// +this.value;
        this.selectionChanged.emit(this.value);
        this.focusableElement.nativeElement.blur();
    }
    getSize() {
        if (this.keepOpen) {
            return this.showItemCount;
        } else {
            if (this.inFocus) {
                return this.showItemCount;
            } else {
                return 1;
            }
        }
    }
    getDisplayProperty(item: any): string {
        let text = "";
        if (typeof item === "string") {
            text = <string>item;
        } else if (typeof item === "number") {
            text =  item.toString();
        } else {
            text = item[this.displayproperty];
        }
        //console.log(`dropdowncontrol: item name ${text}`);
        return text;
    }
    selectedItem(item: any): string | undefined {        
        let result = item === this.value ? 'selected' : undefined;
        //console.log(`checking ${item.name} result is ${result}`);
        return result;
    }
    //get debug() { return JSON.stringify(this, null, 2); }
}
