//import { Component, forwardRef, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, Renderer2 } from "@angular/core";
//import { NG_VALUE_ACCESSOR } from "@angular/forms";

//import { DropdownBase } from "./dropdownbase.type";
///** THIS CONTROL HAS BEEN WITHDRAWN AND IS NO LONGER IN controls.module
// * USE COMBO-BOX INSTEAD */
//@Component({
//  selector: 'dropdown-list',
//  templateUrl: './dropdown-list.component.html',

//  styleUrls: ['./dropdown-list.component.scss'],
//  providers: [
//    {
//      provide: NG_VALUE_ACCESSOR,
//      useExisting: forwardRef(() => DropdownListComponent),
//      multi: true
//    }
//  ],
//})
//export class DropdownListComponent extends DropdownBase {
//  @Input() displayproperty: string = "name";
//  @Input() items: any[] = [];
//  @Input() keepOpen: boolean = false;
//  @Output() selectionChanged = new EventEmitter<any>();
//  @Input() showItemCount: number = 1;

//  private inFocus: boolean = false;
//  constructor(renderer: Renderer2) {
//    super(renderer);
//    this.setReference("dropdown-list");
//    this.localChangeCallBack = (v) => {
//      //console.log(`localChangeCallBack recd: ${JSON.stringify(v)}`);
//    }
//  }
//  onSelectFocus() {
//    this.inFocus = true;
//  }
//  onSelectBlur() {
//    this.inFocus = false;
//  }
//  modelChange(val: any) {
//    console.log("model change");
//    //this.value = val;// +this.value;
//    this.selectionChanged.emit(this.value);
//    this.focusableElement.nativeElement.blur();
//  }
//  getSize() {
//    if (this.keepOpen) {
//      return this.showItemCount;
//    } else {
//      if (this.inFocus) {
//        return this.showItemCount;
//      } else {
//        return 1;
//      }
//    }
//  }
//  getDisplayProperty(item: any): string {
//    let text = "";
//    if (typeof item === "string") {
//      text = <string>item;
//    } else if (typeof item === "number") {
//      text = item.toString();
//    } else {
//      text = item[this.displayproperty];
//    }
//    //console.log(`dropdowncontrol: item name ${text}`);
//    return text;
//  }
//  selectedItem(item: any): string | undefined {
//    let result = item === this.value ? 'selected' : undefined;
//    //console.log(`checking ${item.name} result is ${result}`);
//    return result;
//  }
//  //get debug() { return JSON.stringify(this, null, 2); }
//}
