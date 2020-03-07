import { Component, OnInit, ViewChild } from '@angular/core';
import { Dictionary } from '../../fastnet/core/dictionary.types';
import { ValidationMethod } from '../../fastnet/controls/controlbase.type';
import { ValidationContext, ValidationResult } from '../../fastnet/controls/controls.types';
import { InlineDialogComponent } from '../../fastnet/controls/inline-dialog.component';
import { AuthenticationService, Credentials } from '../services/authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    @ViewChild(InlineDialogComponent, { static: false }) dialog: InlineDialogComponent;
    private logValidations = false;
    email: string;
    password: string;
    errorMessage: string;
    validators: Dictionary<ValidationMethod>;

    constructor(private router: Router, private authenticationService: AuthenticationService) {
        console.log(`LoginComponent`);
    }

    ngOnInit() {
        this.addValidators();
    }

    async onLogin() {
        let r = await this.isValid();
        if (r) {
            let credentials = new Credentials();
            credentials.email = this.email;
            credentials.password = this.password;
            let user = await this.authenticationService.login(credentials);
            if (user !== null) {
                this.router.navigate(['/']);
            } else {
                this.errorMessage = "Email and/or password is invalid";
            }
        }
        else {
            console.error('dialog invalid')
        }
    }
    
    async isValid() {
        let results = await this.dialog.validate();
        let r = results.length == 0;
        if (!r) {
            let c = results[0].control;
            c.focus();
        }
        return r;
    }
    canLogin() {
        let r = this.email && this.email.length > 0 && this.password && this.password.length > 0 ? true : false;
        return r;
    }
    onChange() {
        this.errorMessage = "";
    }
    private addValidators() {
        this.validators = new Dictionary<ValidationMethod>();
        this.validators.add("email", (vc, v) => {
            this.logValidationField("email");
            return this.emailValidatorAsync(vc, v);
        });
        this.validators.add("password", (vc, v) => {
            this.logValidationField("password");
            return this.passwordValidatorAsync(vc, v);
        });
    }
    private emailValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
        return this.isRequired(val, "an email is required");
    }
    public passwordValidatorAsync(cs: ValidationContext, val: string): Promise<ValidationResult> {
        return this.isRequired(val, "a password is required");
    }
    private async isRequired(val: string, message: string) {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            let text = val || "";
            if (text.length === 0) {
                vr.valid = false;
                vr.message = message;
            }
            resolve(vr);
        });
    }
    private logValidationField(fieldName: string) {
        if (this.logValidations) {
            console.log(`validating field ${fieldName}`);
        }
    }
}
