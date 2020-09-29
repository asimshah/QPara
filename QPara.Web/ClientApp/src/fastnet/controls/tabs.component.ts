import { Component, OnInit, AfterContentInit, ContentChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { TabComponent } from './tab.component';


@Component({
   selector: 'tabs',
   templateUrl: './tabs.component.html',
   styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {

   @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
   @Output() tabChanged = new EventEmitter<TabComponent>();
   // contentChildren are set
   ngAfterContentInit() {
      // get all active tabs
      let index = 0;
      this.tabs.toArray().forEach(tab => tab.index = index++);
      let activeTabs = this.tabs.filter((tab) => tab.active);

      // if there is no active tab set, activate the first
      if (activeTabs.length === 0) {
         this.selectTab(this.tabs.first);
      }
   }
   onTabClick(tab: TabComponent) {
      this.selectTab(tab);
   }
   selectTab(tab: TabComponent) {
      // deactivate all tabs
      this.tabs.toArray().forEach(tab => tab.active = false);

      // activate the tab the user has clicked on.
      tab.active = true;
      this.tabChanged.next(tab);
   }
   getTabZIndex(tab: TabComponent) {
      if (this.tabs) {
         let count = this.tabs.length;
         if (tab.active) {
            return count + 30;
         }
         return (count - tab.index) + 20;
      }
      return 20;
   }
   getLeftMargin(tab: TabComponent) {
      if (tab.index > 0) {
         return "-2px";
      } else {
         return "0";
      }
   }
}

