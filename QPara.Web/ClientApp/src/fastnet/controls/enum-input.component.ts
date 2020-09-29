import { Component, Input, forwardRef, ViewEncapsulation, AfterViewInit, OnInit, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controlbase.type";
import { EnumControlBase } from "./enumcontrolbase";
import { InputControlBase } from "./inputcontrolbase";
import { toEnumValues } from "../core/common.functions";
import { EnumValue } from "../core/core.types";

@Component({
    selector: 'enum-input',
    template: `
        <div  [ngClass]="{'is-mobile': isMobileDevice(),'enum-border': shouldHaveBorder(), 'disabled' : disabled}" >
            <div class="enum-group" [ngStyle]="{'grid-template-columns': gridColumns()}"  >
                <div class="enum-item" *ngFor="let item of items" [ngClass]="{selected: isSelected(item)}" (click)="onClick(item)">
                    <span class="outer-circle"></span>
                    <span class="inner-circle"></span>
                    <span class="item-label" >{{item.name}}</span>
                </div>
            </div>
        </div>
        <div class="enum-label" [ngClass]="{'disabled' : disabled}">
            <span [innerHTML]="label"></span>
            <span *ngIf="traceReferences" class="trace-text">{{getReference()}}</span>
        </div>  
`,
    styleUrls: ['./enum-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EnumInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => EnumInputControl)
        }
    ]
})
export class EnumInputControl extends EnumControlBase<number> implements OnInit {
    private static index: number = 0;
   groupName: string = "";
   @Input() noborder;
   constructor() {
        super();
        this.setReference("enum");
    }
    ngOnInit() {
        if (this.enumType) {
           this.items = toEnumValues(this.enumType);
           if (this.names && this.names.length === this.items.length) {
              for (let index = 0; index < this.items.length; index++) {
                 this.items[index].name = this.names[index];
              }
           }
        }
    }

    onClick(item: EnumValue) {
        this.console(`onClick() with ${item.value}`);
        this.writeValue(item.value);
    }
    isSelected(item: EnumValue): boolean {
        let r = this.selectedValue === item.value;//false;
        this.console(`isSelected(): ${this.selectedValue} versus ${item.value} (${item.name}), returns ${r}`);
        return r;
   }
   shouldHaveBorder() {
      if (this.noborder !== undefined) {
         return false;
      }
      return true;
   }
}
