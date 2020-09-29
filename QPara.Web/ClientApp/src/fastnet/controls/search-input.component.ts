import { Component, forwardRef, Output, EventEmitter, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ControlBase } from "./controlbase.type";
import { InputControlBase } from "./inputcontrolbase";

@Component({
    selector: 'search-input',
    templateUrl: './search-input.component.html',
    styleUrls: ['./search-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => SearchInputControl)
        }
    ]
})
export class SearchInputControl extends InputControlBase {
    //private static controlCount = 0;
    @Output() searchClick = new EventEmitter();
    @Output() clearClick = new EventEmitter();
    //public controlId: string = `sic_${++SearchInputControl.controlCount}`;
   constructor(elem: ElementRef) {
        super(elem);
        this.setReference("search");
    }
    clearSearchText() {
        this.writeValue("");
        this.onTextChanged(null);
        this.focus();
    }
    onSearchClick(event: any) {
        //console.log("SearchInputControl: onSearchClick()");
        this.searchClick.emit(event);
    }
    onKeyUp(event: any) {
        //console.log(JSON.stringify(event));
        if (event.keyCode === 13) {
            this.searchClick.emit(event);
        }
    }
    onTextChanged(event: any) {
        //console.log(`SearchInputControl: ${this.value}`);
        if (this.value == "") {
            this.clearClick.emit();
        }
    }
}
