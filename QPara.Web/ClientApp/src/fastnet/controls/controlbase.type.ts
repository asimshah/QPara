import { ControlValueAccessor } from "@angular/forms";
import { Input, ViewChild, ElementRef, OnInit, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from "@angular/core";
import { ValidationResult, ValidationContext } from './controls.types';
import { EnumValue, ILoggingService, Severity } from "../core/core.types";

export class Logger {    
    public static loggingService: ILoggingService;
    public logMessage( s: Severity, t: string) {
        var ls = Logger.loggingService;
        if (ls) {
            switch (s) {
                case Severity.trace:
                    ls.trace(t);
                    break;
                case Severity.debug:
                    ls.debug(t);
                    break;
                case Severity.information:
                    ls.information(t);
                    break;
                case Severity.warning:
                    ls.warning(t);
                    break;
                case Severity.error:
                    ls.error(t);
                    break;
            }
        } else {
            switch (s) {
                case Severity.trace:
                    console.trace(t);
                    break;
                case Severity.debug:
                    console.debug(t);
                    break;
                case Severity.information:
                    console.info(t);
                    break;
                case Severity.warning:
                    console.warn(t);
                    break;
                case Severity.error:
                    console.warn(t);
                    break;
            }
        }
    }
}

/** a method that returns a Promise<ValidationResult>, used for custom control validations */
export type ValidationMethod = (ctx: ValidationContext, val: any) => Promise<ValidationResult>;


const noop = () => { };



/**
 * base class for all custom html components used in fastnet forms
 * adds the following @Input() attributes:
 * [label] optional control label text - can be html
 * [placeholder] placeholder within html <input> element, default ""
 * [disabled] set to true or false, use this to detect and set custom control as disabled, default is false
 * [focus] if true, sets initial focus to this control, use only on one control within the dialog
 * */
export class ControlBase implements ControlValueAccessor, AfterViewInit {
    private static counter = 0;
    private static _trace: boolean = false;
    public static deviceSensitivity = false;
    private reference: string = "";
    protected readonly controlNumber: number;
    public readonly controlId: string;
    @ViewChild('focushere', { static: false }) focusableElement: ElementRef;
    @Input() label?: string;
    @Input() placeHolderText: string = "";
    @Input() disabled: boolean = false;
    @Input('focus') isFocused: boolean;
    @Input() log: string;
    protected innerValue: any = null;
    protected onChangeCallback: (_: any) => void = noop;
    protected onTouchedCallback: () => void = noop;
    protected _isTouched: boolean = false;
    protected get isTouched(): boolean {
        return this._isTouched;
    }
    protected set isTouched(val: boolean) {
        //console.log(`${this.getReference()}: changing isTouched from ${this._isTouched} to ${val}`);
        this._isTouched = val;
    }
    protected localChangeCallBack: (_: any) => void = noop;
    protected afterValidationCallBack: () => void = noop;
    @Input() validator: ValidationMethod;
    private preValidator: ValidationMethod;
    vr: ValidationResult = new ValidationResult();

    constructor() {
        this.controlNumber = ControlBase.counter++;
        this.controlId = `fc_${this.controlNumber}`;
    }

    ngAfterViewInit() {
        if (this.isFocused) {
            this.focus();
        }
    }
    hasLabel(): boolean {
        let r = true;
        if (!this.label || this.label.trim().length === 0) {
            r = false;
        }
        return r;
    }
    get value(): any {
        return this.innerValue;
    }
    set value(v: any) {
        this.console(`set value called with ${JSON.stringify(v)}, innerValue is ${JSON.stringify(this.innerValue)}`);
        if (v === undefined) /*(typeof v === 'undefined')*/ {
            // **** I do not understand how v is not defined - it may be soemthing to do with webpack
            // need to check if this ever happens in production!!!!!!!!!
            v = null;
            this.innerValue = null;
        }
        if (v !== this.innerValue) {
            this.console(`value change`);
            this.innerValue = v;
            this.onValueChanged();
        } else {
            this.console(`no value change`);
        }
    }
    writeValue(obj: any): void {
        this.value = obj;
        this.console(`writeValue() has written ${JSON.stringify(obj)}`);
    }
    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouchedCallback = () => {
            this.isTouched = true;
            fn();
        }
    }
    /**
     * sets an 'internal' validator for a custom control (e.g, see email input)
     * this validator, if set,  is called before any user provided validators.
     * user provided validators only execute if the prevalidor returns a valid condition
     * @param validator
     */
    setPrevalidator(validator: (ctx: ValidationContext, value: any) => Promise<ValidationResult>) {
        this.preValidator = validator;// new PropertyValidatorAsync(validator);
    }
    get traceReferences(): boolean {
        return ControlBase._trace;
    }
    /** set focus on the control
     *  the html for the control must have an element marked with #focushere */
    public focus() {
        if (this.focusableElement) {
            this.focusableElement.nativeElement.focus();
        } else {
            console.log(`no focusable element present`);
        }
    }
    /**
     * Validate this control.
     * (1) this method is called internally using ValidationContext.LostFocus
     * (2) it can be called directly using ValidationContext.UserCall (which is the default)
     * @param context default is ValidationContext.UserCall
     */
    public async validate(context: ValidationContext = ValidationContext.UserCall): Promise<ValidationResult> {
        return new Promise<ValidationResult>(async resolve => {
            let vr = await this.doValidation(context);
            this.afterValidationCallBack();
            resolve(vr);
        });
    }
    onBlur() {
        //console.log(`${this.getReference()}: onBlur() called`);
        //this.onTouchedCallback();
    }
    resetValidation() {
        this.vr = new ValidationResult();
    }
    /** returns true or false based on whether the control is valid or not
     * use this method in custom control templates
     * */
    isInError() {
        return this.vr && this.vr.valid === false;
    }
    /** returns the (internal) reference string for this instance
     * Note that references must be set in the constructor of the derived custom control component */
    getReference(): string {
        return this.reference;
    }
    protected setReference(prefix: string) {
        this.reference = `${prefix}-${this.controlNumber}`;
    }
    protected console(text: string) {
        if (this.log) {
            console.log(`${this.log}: ${text}`)
        }
    }
    public isTouchDevice() {
        if (ControlBase.deviceSensitivity) {
            let mq = matchMedia("(hover: none)");
            return mq.matches;
        } else {
            return false;
        }
    }
    private onValueChanged() {
        this.localChangeCallBack(this.innerValue);
        this.onChangeCallback(this.innerValue);
        setTimeout(async () => {
            await this.doValidation(ValidationContext.ValueChanged);
            this.afterValidationCallBack();
        }, 0);
    }
    private async doValidation(context: ValidationContext): Promise<ValidationResult> {
        this.console(`doValidation(): context ${ValidationContext[context]}, isTouched ${this.isTouched}, value ${JSON.stringify(this.value)}`);
        return new Promise<ValidationResult>(async resolve => {
            try {
                this.vr = new ValidationResult();
                let shouldValidate = false;
                if (this.isTouched) {
                    // always validate once the user has entered/interacted with the control
                    shouldValidate = true;
                } else {
                    switch (context) {
                        case ValidationContext.LostFocus:
                        case ValidationContext.DialogValidation:
                            shouldValidate = true;
                            break;
                        default:
                        case ValidationContext.UserCall:
                            break;
                        case ValidationContext.ValueChanged:
                            break;
                    }
                }
                this.console(`doValidation(): context ${ValidationContext[context]}, isTouched ${this.isTouched}, value ${JSON.stringify(this.value)}, shouldValue ${shouldValidate}`);
                if (shouldValidate) {
                //if (this.isTouched === true || context !== ValidationContext.ValueChanged) {
                    try {
                        if (this.preValidator) {
                            this.vr = await this.preValidator(context, this.value);//.validator(cs);
                        }
                        if (this.vr.valid === true && this.validator) {
                            this.vr = await this.validator(context, this.value);//.validator(cs);
                        }
                    } catch (e) {
                        console.error(`error = ${e}`);
                        this.vr.valid = false;
                        this.vr.message = e;
                    } finally {
                        resolve(this.vr);
                    }
                } else {
                    resolve(this.vr);
                }
            } catch (e) {
                console.error(`error = ${e}`);
            }
        });
    }

    public static enableTrace(tf: boolean) {
        ControlBase._trace = tf;
        console.log(`custom control trace enabled = ${ControlBase._trace}`);
    }
}
/** Use this as a base for any control based on the HTML <input> element
 * Note that (1) all input events are caught and used to set isTouched to true
 * and (2) lostfocus event will cause validation with ValidationContext.LostFocus
 */
export class InputControlBase extends ControlBase implements OnChanges, AfterViewInit {
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
/**
 * Use this as a base for controls using radio buttons for enums
 * generic T is one of number or boolean - this is the value type of the enum
 * boolean allows the use of enum style layout for a boolean
 * adds the following @Input() attributes:
 * [columns]   number of columns in which to layout radio buttons, default 1
 * [enumType]  the typescript enum type to layout
 * [items]     internal use only (can this be removed as an @Input()?)
 * [names]     user friendly names to use for each enum value
 * */
export class EnumControlBase<T> extends ControlBase {
    /**
     * Number of columns in which to layout the radio buttons
     */
    @Input() columns: number = 1;
    @Input() enumType: any; // make sure this is the enum type
    @Input() items: EnumValue[] = [];
    //@Input() names: string[];
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
        this.localChangeCallBack = (v) => { this.selectedValue = v };
    }
    gridColumns(): string {

        return "auto ".repeat(this.columns);
    }
}
