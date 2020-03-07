import { Component, OnInit } from '@angular/core';
import { Statistics } from '../shared/common.types';
import { MembersService } from '../services/members.service';

@Component({
    selector: 'qp-counters',
    templateUrl: './counters.component.html',
    styleUrls: ['./counters.component.scss']
})
export class CountersComponent implements OnInit {
    statistics: Statistics;
    constructor(private membersService: MembersService) {

    }

    async ngOnInit() {
        this.statistics = await this.membersService.getStats();
    }

}
