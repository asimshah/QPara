import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TreeViewComponent } from './tree-view.component';
import { TextInputControl } from './text-input.component';
import { MultilineTextInput } from './multiline-input.component';
import { SearchInputControl } from './search-input.component';
import { PasswordInputControl } from './password-input.component';
import { EmailInputControl } from './email-input.component';
import { NumberInputControl } from './number-input.component';
import { DateInputControl } from './date-input.component';
import { BoolInputControl } from './bool-input.component';
import { EnumInputControl } from './enum-input.component';
import { BoolEnumInputControl } from './bool-enum-input.component';
import { DropDownControl } from './dropdown-input.component';
import { InlineDialogComponent } from './inline-dialog.component';
import { ComboBoxComponent } from './combo-box.component';
import { PopupDialogComponent } from './popup-dialog.component';
import { PopupMessageComponent } from './popup-message.component';
import { ScrollableTableComponent, ScrollableTableColumnComponent, ScrollableTableRowComponent, ScrollableTableHeaderComponent, ScrollableTableBodyComponent, ScrollableTableCellComponent } from './scrollable-table.component';
import { PopupPanelComponent } from './popup-panel.component';
import { BusyIndicatorComponent } from './busy-indicator.component';

@NgModule({
    imports: [        
        CommonModule,
        FormsModule
    ],
    exports: [
        TextInputControl,
        MultilineTextInput,
        SearchInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl,
        TreeViewComponent,
        InlineDialogComponent,
        ComboBoxComponent,
        PopupDialogComponent,
        PopupMessageComponent,
        ScrollableTableComponent,
        ScrollableTableHeaderComponent,
        ScrollableTableBodyComponent,
        ScrollableTableColumnComponent,
        ScrollableTableRowComponent,
        ScrollableTableCellComponent,
        PopupPanelComponent,
        BusyIndicatorComponent
    ],
    declarations: [
        TextInputControl,
        MultilineTextInput,
        SearchInputControl,
        PasswordInputControl,
        EmailInputControl,
        NumberInputControl,
        DateInputControl,
        BoolInputControl,
        EnumInputControl,
        BoolEnumInputControl,
        DropDownControl,
        TreeViewComponent,
        InlineDialogComponent,
        ComboBoxComponent,
        PopupDialogComponent,
        PopupMessageComponent,
        ScrollableTableComponent,
        ScrollableTableHeaderComponent,
        ScrollableTableBodyComponent,
        ScrollableTableColumnComponent,
        ScrollableTableRowComponent,
        ScrollableTableCellComponent,
        PopupPanelComponent,
        BusyIndicatorComponent
    ],
    providers: [

    ],
})
export class ControlsModule { }
