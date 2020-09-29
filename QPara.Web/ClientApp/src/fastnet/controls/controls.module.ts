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
//import { DropdownListComponent } from './dropdown-list.component';
import { InlineDialogComponent } from './inline-dialog.component';
import { ComboBoxComponent } from './combo-box.component';
import { PopupDialogComponent } from './popup-dialog.component';
import { PopupMessageComponent } from './popup-message.component';
import { ScrollableTableComponent, ScrollableTableColumnComponent, ScrollableTableRowComponent, ScrollableTableHeaderComponent, ScrollableTableBodyComponent, ScrollableTableCellComponent } from './scrollable-table.component';
import { PopupPanelComponent } from './popup-panel.component';
import { BusyIndicatorComponent } from './busy-indicator.component';
import { ListComponent } from './list.component';
import { ListViewComponent } from './list-view.component';
import { TooltipDirective } from './tooltip.directive';
import { TooltipContentComponent } from './tooltip-content.component';
import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';
import { ExpandingPanelsComponent } from './expanding-panels.component';
import { SliderComponent } from './slider.component';

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
      //DropdownListComponent,
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
      BusyIndicatorComponent,
      ListComponent,
      ListViewComponent,
      TooltipDirective,
      TooltipContentComponent,
      TabComponent,
      TabsComponent,
      ExpandingPanelsComponent,
      SliderComponent
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
      //DropdownListComponent,
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
      BusyIndicatorComponent,
      ListComponent,
      ListViewComponent,
      TooltipDirective,
      TooltipContentComponent,
      TabComponent,
      TabsComponent,
      ExpandingPanelsComponent,
      SliderComponent
   ],
   providers: [

   ],
})
export class ControlsModule { }
