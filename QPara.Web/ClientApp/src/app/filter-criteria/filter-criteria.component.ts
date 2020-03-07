import { Component, ViewChild, Input, OnInit } from "@angular/core";
import { PopupDialogComponent } from "../../fastnet/controls/popup-dialog.component";
import { EnumValue, DialogResult } from "../../fastnet/core/core.types";
import { PaymentMethod, MinutesDeliveryMethod, SubscriptionPeriod, SubscriptionType, ColumnMetadata, ColumnNames } from "../shared/common.types";
import { MembersService } from "../services/members.service";


@Component({
    selector: 'qp-filter-criteria',
    templateUrl: './filter-criteria.component.html',
    styleUrls: ['./filter-criteria.component.scss']
})
export class FilterCriteriaComponent implements OnInit {
    ColumnNames = ColumnNames;
    @ViewChild(PopupDialogComponent, { static: false }) popup: PopupDialogComponent;
    @Input() caption = "Filter Criteria";
    PaymentMethod = PaymentMethod;
    MinutesDeliveryMethod = MinutesDeliveryMethod;
    SubscriptionPeriod = SubscriptionPeriod;
    SubscriptionType = SubscriptionType;
    filterCriteria: ColumnMetadata[];
    zoneList: EnumValue[];
    private savedFilter: string;
    constructor(private memberService: MembersService) { }
    async ngOnInit() {
        //let parameters = await this.memberService.getParametersV2();
        this.zoneList = await this.memberService.getZoneList();
    }
    open(filter: ColumnMetadata[], onClose: (r: DialogResult) => void) {
        this.savedFilter = JSON.stringify(filter);
        this.filterCriteria = filter;
        this.popup.open((r: DialogResult) => {
            onClose(r);

        });
    }
    onApply() {
        this.popup.close(DialogResult.ok);
    }
    onCancel() {
        this.filterCriteria = JSON.parse(this.savedFilter);
        this.popup.close(DialogResult.cancel);
    }
}
