import { Component, OnInit } from '@angular/core';
import { MembersService } from '../services/members.service';
import { DocumentInfo } from '../shared/common.types';

@Component({
    selector: 'qp-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
    list: DocumentInfo[] = [];
    constructor(private memberService: MembersService) { }

    async ngOnInit() {
        this.list = await this.memberService.getDocumentList();
    }

}
