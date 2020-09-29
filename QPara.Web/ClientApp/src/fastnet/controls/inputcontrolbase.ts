import { AfterViewInit, OnChanges, SimpleChanges, ElementRef } from "@angular/core";
import { ValidationContext } from './controls.types';
import { ControlBase } from "./controlbase.type";
/** Use this as a base for any control based on the HTML <input> element
 * Note that (1) all input events are caught and used to set isTouched to true
 * and (2) lostfocus event will cause validation with ValidationContext.LostFocus
 */
export class InputControlBase extends ControlBase implements OnChanges, AfterViewInit {
   constructor(protected elem: ElementRef) {
      super();
      this.elem.nativeElement.fastnetComponent = this;
   }
    onBlur() {
        super.onBlur();
        this.validate(ValidationContext.LostFocus);
    }
    ngAfterViewInit() {
        this.setReadOnly();
    }
    ngOnChanges(changes: SimpleChanges) {
        this.setReadOnly();
    }
    onInput() {
        // why do we need this?
        //  because we need to differentiate between users entering something in an input element and
        //  the value being set in other ways.
        // Yes, but why don't I call this.onTouchedCallback() - perhaps I don't want controls to override this behaviour any more??
        this.isTouched = true;
    }
    setReadOnly() {
        if (this.focusableElement) {
            let el = this.focusableElement.nativeElement as HTMLInputElement;
            el.readOnly = this.disabled;
        }
    }
}
