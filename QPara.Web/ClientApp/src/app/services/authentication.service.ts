import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';

const userKey = "currentUser";

export class Credentials {
    email: string;
    password: string;
}
export enum UserType {
    Unknown,
    Administrator,
    StreetRepresentative
}
export class UserProfile {
    name: string;
    type: UserType;
    zoneNumber: number;
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router) {

    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.getCredentials();
        if (currentUser !== null) {
            //console.log(`AuthGuard: canActivate() returning true ...`);
            return true;
        }
        //console.log(`AuthGuard: canActivate() returning false ... navigating to /login`);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
    private getCredentials() {
        let saveduser = localStorage.getItem(userKey);
        if (saveduser !== null) {
            return JSON.parse(saveduser);
        }
        return null;
    }
}


@Injectable({
    providedIn: 'root'
})
export class AuthenticationService extends BaseService {
    isAuthenticated = new BehaviorSubject<boolean>(false);
    private currentUser: UserProfile = null;
    constructor(http: HttpClient) {
        super(http, "auth");
        let saveduser = localStorage.getItem(userKey);
        if (saveduser !== null) {
            this.currentUser = JSON.parse(saveduser);
            this.isAuthenticated.next(true);
        }
    }
    public get user(): UserProfile {
        //console.log(`AuthenticationService: currentUser is ${JSON.stringify(this.currentUser)}`);
        //debugger;
        return this.currentUser;
    }
    public async login(credentials: Credentials) {
        let dr = await this.postAndGetDataResultAsync<Credentials, UserProfile>("login", credentials);
        if (dr.success) {
            this.currentUser = dr.data;
            localStorage.setItem(userKey, JSON.stringify(this.currentUser));
            this.isAuthenticated.next(true);
        } else {

            await this.logout();
        }
        return this.user;
    }
    public async logout() {
        localStorage.removeItem(userKey);
        this.currentUser = null;
        this.isAuthenticated.next(false);
        await this.postAndGetAsync("logout", null);
    }
}
