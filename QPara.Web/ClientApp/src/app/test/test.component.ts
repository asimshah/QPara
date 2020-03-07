import { Component, OnInit } from '@angular/core';
import { TestService } from '../services/test.service';
import { AuthenticationService } from '../services/authentication.service';

export class TestPacket {
    index: number;
    message: string;    
}

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

    constructor(private ts: TestService, private authenticationService: AuthenticationService) { }

    ngOnInit() {
    }
    async onLogout() {
        await this.authenticationService.logout();
    }
    async onTest1() {
        let answer = await this.ts.echo("hello world");
        console.log(`answer is: ${answer}`);
    }
    async onTest2() {
        await this.ts.error1();
    }
    async onTest3() {
        await this.ts.error2();
    }
    async onTest4() {
        let tp = await this.ts.getPacket();
        console.log(`received: ${JSON.stringify(tp)}`);
    }
    async onTest5() {
        let tp = new TestPacket();
        tp.index = 35;
        tp.message = `Index is ${tp.index}`;
        await this.ts.postPacket(tp);
    }
    async onTest6() {
        let tp = new TestPacket();
        tp.index = 41;
        tp.message = `Index is ${tp.index}`;
        let tp2 = await this.ts.postAndReturnPacket(tp);
        console.log(`received: ${JSON.stringify(tp2)}`);
    }
    async onTest7() {
        this.ts.downloadSheet();
    }
}
