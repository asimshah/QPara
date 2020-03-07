import { Component, Input, ViewEncapsulation, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { EnumInputControl } from "./enum-input.component";
//import { EnumValue } from "./controls.types";
import { ControlBase, EnumControlBase } from "./controlbase.type";
import { EnumValue } from "../core/core.types";



@Component({
    selector: 'bool-enum-input',
    template: `
        <div class="enum-border"  [ngClass]="{'disabled' : disabled}" >
            <div class="enum-group" [ngStyle]="{'grid-template-columns': gridColumns()}"  >
                <div class="enum-item" *ngFor="let item of items" [ngClass]="{selected: isSelected(item)}" (click)="onClick(item)">
                    <span class="outer-circle"></span>
                    <span class="inner-circle"></span>
                    <span class="item-label" >{{item.name}}</span>
                </div>
            </div>
        </div>
        <div class="enum-label"  [ngClass]="{'disabled' : disabled}">
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
        </div>  
`,
    styleUrls: ['./bool-enum-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BoolEnumInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => BoolEnumInputControl)
        }
    ]
})
export class BoolEnumInputControl extends EnumControlBase<boolean> {
    @Input() truelabel = "True";
    @Input() falselabel = "False";
    constructor() {
        super();
        this.setReference("bool-enum");
    }
    ngOnInit() {
        this.items = [
            { name: this.truelabel, value: 0 },
            { name: this.falselabel, value: 1 }
        ];
        //if (this.names && this.names.length === this.items.length) {
        //    for (let i = 0; i < this.items.length; ++i) {
        //        this.items[i].name = this.names[i];
        //    }
        //}
        //this.columns = 2;
        //this.selectedValue = this.value;
    }
    isSelected(item: EnumValue): boolean {
        //console.log(`${this.selectedValue} versus ${item.value}`);
        if (item && this.selectedValue != null) {
            let currentValue = item.value === 0 ? true : false;
            return this.selectedValue === currentValue;
        }
        return false;
    }
    onClick(item: EnumValue) {
        //console.log(`onClick() with ${item.value}`);
        let currentValue = item.value === 0 ? true : false;
        this.selectedValue = currentValue;
        this.writeValue(this.selectedValue);
    }
    get debug() { return JSON.stringify(this, null, 2); }
}