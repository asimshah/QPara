import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';


@Component({
  selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    busy: boolean = false;
    constructor(private authenticationservice: AuthenticationService /*private memberService: MembersService*/) {

    }
    async ngOnInit() {
        //this.memberService.setBusyCallback((tf) => this.busy = tf);
        //await this.memberService.getParametersV2();
    }
    isLoggedIn() {
        return this.authenticationservice.user !== null;
    }
    showWait(): boolean {
        return this.busy;
    }
}
