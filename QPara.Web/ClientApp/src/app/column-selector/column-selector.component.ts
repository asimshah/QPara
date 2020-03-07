import { Component, ViewChild, Input } from "@angular/core";
import { PopupDialogComponent } from "../../fastnet/controls/popup-dialog.component";
import { ColumnNames, ColumnMetadata } from "../shared/common.types";

@Component({
    selector: 'qp-column-selector',
    templateUrl: './column-selector.component.html',
    styleUrls: ['./column-selector.component.scss']
})
export class ColumnSelectorComponent {
    @Input() caption = "Column Selector";
    ColumnNames = ColumnNames;
    @ViewChild(PopupDialogComponent, { static: false}) popup: PopupDialogComponent;
    @Input() columns: ColumnMetadata[];

    open(onClose: () => void) {
        this.popup.open((r) => {
            onClose();

        });
    }
    onClose() {
        this.popup.close();
        //alert("close column-selector dialog");
    }
}
