import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ControlsModule } from '../fastnet/controls/controls.module';
import { HttpErrorInterceptor } from './services/base.service';
import { TestComponent } from './test/test.component';
import { AuthenticationInterceptor } from "./services/authenticationInterceptor";
import { LoginComponent } from './login/login.component';
import { AuthGuard, AuthenticationService } from './services/authentication.service';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentsComponent } from './documents/documents.component';
import { CountersComponent } from './counters/counters.component';
import { NoteEditorComponent } from './note-editor/note-editor.component';
import { PaymentEditorComponent } from './payment-editor/payment-editor.component';
import { MemberEditorComponent } from './member-editor/member-editor.component';
import { FilterCriteriaComponent } from './filter-criteria/filter-criteria.component';
import { ColumnSelectorComponent } from './column-selector/column-selector.component';
import { MembersComponent } from './members/members.component';
import { ChangeHistoryComponent } from './change-history/change-history.component';
import { MailchimpComponent } from './mailchimp/mailchimp.component';

export function initApp(authentication: AuthenticationService) {
    return () => {
        let user = authentication.user;
        //console.log(`initApp(): current user is ${JSON.stringify(user)}`);
        return;
    };
}

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        TestComponent,
        LoginComponent,
        NavigationMenuComponent,
        DashboardComponent,
        DocumentsComponent,
        CountersComponent,
        NoteEditorComponent,
        PaymentEditorComponent,
        MemberEditorComponent,
        FilterCriteriaComponent,
        ColumnSelectorComponent,
        MembersComponent,
        ChangeHistoryComponent,
        MailchimpComponent

    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        ControlsModule,
        RouterModule.forRoot([
            { path: 'home', component: MembersComponent, pathMatch: 'full', canActivate: [AuthGuard] },
            { path: 'login', component: LoginComponent },
            { path: 'test', component: TestComponent },
            { path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard] },
            { path: "documents", component: DocumentsComponent, canActivate: [AuthGuard] },
            { path: 'stats', component: CountersComponent, canActivate: [AuthGuard] },
            { path: 'mailchimp', component: MailchimpComponent, canActivate: [AuthGuard] },
            { path: 'history', component: ChangeHistoryComponent, canActivate: [AuthGuard] },
            { path: '**', redirectTo: 'home' }
        ])
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: initApp, multi: true, deps : [AuthenticationService]},
        { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
