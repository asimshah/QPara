import { Component, ViewChild } from '@angular/core';
import { AuthenticationService, UserType, UserProfile } from '../services/authentication.service';
import { Router } from '@angular/router';
import { MemberEditorComponent } from '../member-editor/member-editor.component';
import { MembersService } from '../services/members.service';

@Component({
    selector: 'nav-menu',
    templateUrl: './navigation-menu.component.html',
    styleUrls: ['./navigation-menu.component.scss']
})
export class NavigationMenuComponent {
    @ViewChild(MemberEditorComponent, { static: false }) memberEditor: MemberEditorComponent;
    UserType = UserType;
    user: UserProfile;
    isAuthenticated: boolean = false;
    constructor(private authenticationService: AuthenticationService, private membersService: MembersService, private router: Router) {
        this.authenticationService.isAuthenticated.subscribe((v) => {
            this.isAuthenticated = v;
        });
        this.isAuthenticated = this.authenticationService.isAuthenticated.value;
        //console.warn(`isAuthenticated = ${this.isAuthenticated}`);
        //this.user = this.authenticationService.user;
    }
    userType(): UserType {
        this.user = this.authenticationService.user;
        if (this.user === null) {
            console.warn("no current user!");
            return UserType.Unknown;
        }
        return this.user.type;
    }
    onCreateNewMember() {
        console.log('on create new member');
        this.memberEditor.open(null, (r) => { });
    }
    onLogout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
