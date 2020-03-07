import { Component, OnInit } from "@angular/core";
import { Change } from "../shared/common.types";
import { MembersService } from "../services/members.service";



@Component({
    selector: 'qp-change-history',
    templateUrl: './change-history.component.html',
    styleUrls: ['./change-history.component.scss']
})
export class ChangeHistoryComponent implements OnInit {
    changes: Change[] = [];
    constructor(private memberService: MembersService) {

    }
    async ngOnInit() {
        this.changes = await this.memberService.getChangeHistory();
    }
}
