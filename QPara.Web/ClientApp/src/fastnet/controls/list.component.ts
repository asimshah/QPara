import { Component, OnInit, forwardRef, Input, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, Renderer2, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlBase } from './controlbase.type';

@Component({
   selector: 'list',
   templateUrl: './list.component.html',
   styleUrls: ['./list.component.scss'],
   providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListComponent),
      multi: true
   }]
})
export class ListComponent extends ControlBase implements OnInit, AfterViewInit, AfterViewChecked {
   @Input() displayProperty = "name";
   @Input() dropmode = false;
   @Input() items: any[] = [];
   @Input() maxrows: number = 5;
   @Output() selectedItemChanged = new EventEmitter<any>();
   @Output() selectedIndexChanged = new EventEmitter<number>();
   private selectedIndex: number = -1;
   @ViewChild('itemcontainer', { static: false }) itemContainer: ElementRef;
   private panelHeight: number;
   constructor(private renderer: Renderer2) {
      super();
      this.setReference("list");
   }

   ngOnInit() {
   }
   ngAfterViewInit() {
      super.ngAfterViewInit();
      this.computePanelHeight();
   }
   //
   ngAfterViewChecked() {
      this.setPanelSize();
   }

   getItemDescr(item: any) {
      if (typeof item === "string") {
         return <string>item;
      }
      return item[this.displayProperty];
   }
   onItemClick(index: number) {
      if (true || this.selectedIndex !== index) {
         this.selectedIndex = index;
         this.selectedIndexChanged.next(index);
         this.selectedItemChanged.next(this.items[index]);
      }
   }
   isSelected(index: number) {
      return this.selectedIndex == index;
   }
   private computePanelHeight() {
      let li = this.itemContainer.nativeElement.querySelector('.list-item');
      let rows = Math.min(this.maxrows, this.items.length);
      if (li) {
         this.panelHeight = (rows * li.clientHeight);// + (this.padding * 2);
      }
   }
   private setPanelSize() {
      this.renderer.setStyle(this.itemContainer.nativeElement, 'height', `${this.panelHeight}px`);
      //console.log(`panel size reset`);
   }
}
