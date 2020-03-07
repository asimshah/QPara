import {
    Component, Input,
    QueryList, AfterViewInit, ContentChildren, ContentChild,
    AfterContentInit, AfterContentChecked, EventEmitter, OnDestroy, Output
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
//import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//import { Subscription } from 'rxjs/Subscription';


@Component({
    selector: 'table-column',
    templateUrl: './scrollable-table-column.component.html',
    styleUrls: ['./scrollable-table-column.component.scss']
})
export class ScrollableTableColumnComponent {
    @Input() width: string = "auto";
    constructor() {

    }
}

@Component({
    selector: 'table-cell',
    templateUrl: './scrollable-table-cell.component.html',
    styleUrls: ['./scrollable-table-cell.component.scss']
})
export class ScrollableTableCellComponent {
    constructor() {

    }
}

@Component({
    selector: 'table-row',
    templateUrl: './scrollable-table-row.component.html',
    styleUrls: ['./scrollable-table-row.component.scss']
})
export class ScrollableTableRowComponent {
    columnWidths: string = "";
    constructor() {
        
    }
}


@Component({
    selector: 'table-header',
    templateUrl: './scrollable-table-header.component.html',
    styleUrls: ['./scrollable-table-header.component.scss']
})
export class ScrollableTableHeaderComponent  {
    @ContentChildren(ScrollableTableColumnComponent) columns: QueryList<ScrollableTableColumnComponent>;
    columnWidths: string;
    constructor() {

    }
   
    getColumnsWidths(): string {
        let widths: string[] = [];
        this.columns.forEach(col => {
            widths.push(col.width);
        });
        return widths.join(" ");
    }
}


@Component({
    selector: 'table-body',
    templateUrl: './scrollable-table-body.component.html',
    styleUrls: ['./scrollable-table-body.component.scss']
})
export class ScrollableTableBodyComponent implements AfterContentChecked {
    @ContentChildren(ScrollableTableRowComponent) rows: QueryList<ScrollableTableRowComponent>;
    columnWidths: string = "";

    private readySource = new BehaviorSubject<boolean>(false);
    onReady$ = this.readySource.asObservable();
    constructor() {

    }

    ngAfterContentChecked() {
        if (this.rows) {
            let rowlist = this.rows.toArray();
            //console.log(`ngAfterContentChecked: ${rowlist.length} rows found`);
            let ready = this.readySource.getValue();
            if (!ready && this.rows.length > 0) {
                setTimeout(() => {
                    this.rows.forEach((r) => {
                        if (r.columnWidths === "") {
                            r.columnWidths = this.columnWidths;
                            //console.log(`set row widths to ${r.columnWidths}`);
                        }
                    });
                    this.readySource.next(true);
                }, 0);
            }
        }
    }
    reset() {
        this.readySource.next(false);
    }
}


@Component({
    selector: 'scrollable-table',
    templateUrl: './scrollable-table.component.html',
    styleUrls: ['./scrollable-table.component.scss']
})
export class ScrollableTableComponent implements OnDestroy, AfterContentInit/*,  AfterContentChecked*/ {
    @ContentChild(ScrollableTableHeaderComponent, { static: false }) header: ScrollableTableHeaderComponent;
    @ContentChild(ScrollableTableBodyComponent, { static: false }) body: ScrollableTableBodyComponent;
    columnWidths: string = "";
    @Input() showSearch: boolean = true;
    @Input() caption: string;
    @Input() busyText = "Loading data, please wait ...";
    @Output() searchclear = new EventEmitter<void>();
    @Output() search = new EventEmitter<string>();
    searchText: string;
    ready = false;
    private bodySubscription: Subscription;
    constructor() {

    }
    ngOnDestroy() {
        if (this.bodySubscription) {
            this.bodySubscription.unsubscribe();
        }
    }
    onSearchClear() {
        this.body.reset();
        this.searchclear.emit();
    }
    onSearch() {
        this.body.reset();
        this.search.emit(this.searchText);
    }
    ngAfterContentInit() {
        if (this.header) {
            //console.log(`ngAfterContentInit: header found`);
            this.columnWidths = this.header.getColumnsWidths();
            this.header.columnWidths = this.columnWidths;
        }
        if (this.body && !this.bodySubscription) {
            this.bodySubscription = this.body.onReady$
                .subscribe((r) => {
                    this.ready = r;
                });
            //console.log(`ngAfterContentInit: body found`);
            this.body.columnWidths = this.columnWidths;
        }
    }
}

