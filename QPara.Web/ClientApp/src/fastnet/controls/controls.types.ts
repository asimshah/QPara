

export enum ValidationContext {
    ValueChanged,
    LostFocus,
    UserCall,
    DialogValidation // i.e. all controls being validated from (DialogBase)
}

export class ValidationResult {
    valid: boolean;
    message: string;
    constructor() {
        this.valid = true;
        this.message = '';
    }
}


