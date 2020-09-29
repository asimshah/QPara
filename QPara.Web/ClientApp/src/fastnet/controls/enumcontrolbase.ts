import { Input, ElementRef } from "@angular/core";
import { EnumValue } from "../core/core.types";
import { ControlBase } from "./controlbase.type";
/**
 * Use this as a base for controls using radio buttons for enums
 * generic T is one of number or boolean - this is the value type of the enum
 * boolean allows the use of enum style layout for a boolean
 * adds the following @Input() attributes:
 * [columns]   number of columns in which to layout radio buttons, default 1
 * [enumType]  the typescript enum type to layout
 * [items]     internal use only (can this be removed as an @Input()?)
 * [names]     user friendly names to use for each enum value, array length must match the count of members of the enumType
 * */
export class EnumControlBase<T> extends ControlBase {
    /**
     * Number of columns in which to layout the radio buttons
     */
    @Input()
    columns: number = 1;
    @Input()
    enumType: any; // make sure this is the enum type
    @Input()
    items: EnumValue[] = [];
    @Input()
    names: string[];
    get selectedValue(): T | null {
        return this._selectedValue;
    }
    set selectedValue(v: T | null) {
        this._selectedValue = v;
        this.console(`_selectedValue set to ${v}`);
    }
    private _selectedValue: T | null;
   constructor() {
        super();
        this.localChangeCallBack = (v) => { this.selectedValue = v; };
    }
    gridColumns(): string {
        return "auto ".repeat(this.columns);
    }
}
