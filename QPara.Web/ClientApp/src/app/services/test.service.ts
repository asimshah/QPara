import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { TestPacket } from '../test/test.component';



@Injectable({
  providedIn: 'root'
})
export class TestService extends BaseService {
    constructor(http: HttpClient) {
        super(http, "test");
    }
    public async echo(msg: string) {
        return this.getAsync<string>(`echo/${msg}`);

    }
    public async error1() {
        return this.getAsync<void>(`error/1`);
    }
    public async error2() {
        return this.getAsync<void>(`error/2`);
    }
    public async getPacket() {
        return this.getAsync<TestPacket>(`get/packet`);
    }
    public async postPacket(tp: TestPacket) {
        await this.postAndGetAsync("post/packet", tp);
    }
    public async postAndReturnPacket(tp: TestPacket) {
        return await this.postAndGetAsync<TestPacket, TestPacket>("return/packet", tp);
    }
    public async downloadSheet() {
        let df = await this.downloadFileAsync("download/sheet");
        this.saveFile(df.filename, df.data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
