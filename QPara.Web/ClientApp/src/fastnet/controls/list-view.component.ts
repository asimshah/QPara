import { Component, OnInit, TemplateRef, ContentChild, Input, ViewEncapsulation, EmbeddedViewRef, AfterViewInit, AfterContentChecked, AfterViewChecked, AfterContentInit, ViewChild, ViewContainerRef, ElementRef, Output, EventEmitter, Renderer2, ViewChildren, QueryList } from '@angular/core';
import { ControlBase } from './controlbase.type';

export class ListViewItemMoved {
   from: number;
   to: number;
}
/**
 * display an array of items in a user designed manner from which a single item can be selected
 * the header for the list is shown using <ng-template #headerTemplate>
 * each item is shown using <ng-template #itemTemplate let-item> where let-item allows access to an individual item (from [items])
 * Bother the header template and the item template are set as "display: grid" with "grid-template-columns" set to "1fr"
 * [maxRows] (optional) limits the vertical height to show maxRows rows (with a scroll basr if required)
 * [items] set this to an array of objects
 * gridTemplateColumns css string such as "1fr 100px 100px", default is "1fr" (use only nFr and fixed width columns to ensure alignment of header and items parts)
 * (selectedItemChanged) raised whenever the selected changes - $event contains the selected item (also avaliable as the selectedItem property)
 * #itemTemplate variables are let-item, let-xxx="index", let-xxx="even", let-xxx="odd", let-xxx="first" and let-xxx="last"
 * */
@Component({
   selector: 'list-view',
   templateUrl: './list-view.component.html',
   styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent extends ControlBase implements AfterViewInit, AfterViewChecked {
   @ContentChild('headerTemplate', { static: false, read: TemplateRef }) headerTemplate: TemplateRef<any>; // used by [ngTemplateOutlet]
   @ContentChild('itemTemplate', { static: false, read: TemplateRef }) itemTemplate: TemplateRef<any>; // used by [ngTemplateOutlet]
   @ViewChild('bodycontainer', { static: false }) bodyContainer: ElementRef;
   @ViewChild('headercontainer', { static: false }) headerContainer: ElementRef;
   //@ViewChildren('itemContainer', { read: ElementRef }) itemRefList: QueryList<ElementRef>;
   @Input() items: Array<any> = [];
   @Input() gridTemplateColumns: string = '1fr';
   @Input() maxRows;
   @Input() userResequenceAble = false;
   @Output() selectedItemChanged = new EventEmitter<any>();
   @Output() itemMoved = new EventEmitter<ListViewItemMoved>();
   //private currentItems: Element[] = [];
   private isDragging = false;
   private indexOnDragStart = -1;
   private currentDropTarget: HTMLElement = null;
   private currentDropLocation: HTMLElement = null;
   selectedItem: any;

   constructor(private renderer: Renderer2) { super(); }
   canDragRows() {
      return this.userResequenceAble;
   }
   ngAfterViewInit() {
      if (!this.headerTemplate) {
         this.renderer.setStyle(this.headerContainer.nativeElement, "display", `none`);
      }
   }
   getGridTemplateColumns() {
      return this.gridTemplateColumns;
   }
   onListItemClick(item: any) {
      if (this.isDragging === false) {
         this.selectedItem = item;
         this.selectedItemChanged.next(item);
      }
   }
   ngAfterViewChecked() {
      if (this.maxRows) {
         if (this.maxRows < this.items.length) {
            if (!this.isMobileDevice()) {
               this.renderer.setStyle(this.headerContainer.nativeElement, "padding-right", `20px`);
            }
            let itemDiv: HTMLElement = this.bodyContainer.nativeElement.querySelector('.list-view-item');
            var itemHeight = itemDiv.clientHeight;
            let panelHeight = this.maxRows * itemHeight;
            if (this.bodyContainer.nativeElement.clientHeight !== panelHeight) {
               this.renderer.setStyle(this.bodyContainer.nativeElement, "height", `${panelHeight}px`);
            }
         } else {
            this.renderer.removeStyle(this.bodyContainer.nativeElement, "height");
            this.renderer.removeStyle(this.headerContainer.nativeElement, "padding-right");
         }
      }
   }
   onDrop(e: DragEvent, index: number) {
      let args = new ListViewItemMoved();
      args.from = this.indexOnDragStart;
      args.to = index;
      this.itemMoved.next(args);
   }
   onDragStart(e: DragEvent, index: number) {
      e.stopPropagation()
      e.dataTransfer.effectAllowed = "move";
      this.indexOnDragStart = index;
      this.isDragging = true;
   }
   onDragEnd(e: DragEvent, index: number) {
      this.clearDropTarget();
      this.indexOnDragStart = -1;
      this.isDragging = false;
   }
   onDragOver(e: DragEvent, index: number) {
      e.preventDefault();
   }
   onDragEnter(e: DragEvent, index: number) {
      e.preventDefault();
      let target = <HTMLElement>e.currentTarget;
      let isLocation = target.classList.contains("list-view-item") ? false : true;
      if (this.isValidTarget(index)) {
         if (isLocation) {
            this.setDropLocationHigh(target);
         } else {
            this.setDropTarget(target);
         }
      } else {
         if (isLocation) {
            this.clearDropLocationHigh();
         } else {
            this.clearDropTarget();
         }
      }
   }
   onDragLeave(e: DragEvent, index: number) {
      e.preventDefault();
   }
   private isValidTarget(index: number) {
      let result = index < this.indexOnDragStart || index > (this.indexOnDragStart + 1);
      return result;
   }
   private clearDropTarget() {
      if (this.currentDropTarget !== null) {
         this.currentDropTarget.classList.remove("drop-target");
      }
   }
   private clearDropLocationHigh() {
      if (this.currentDropLocation !== null) {
         this.currentDropLocation.classList.remove("highlight");
      }
   }
   private setDropTarget(element: HTMLElement) {
      if (element.classList.contains("list-view-item")) {
         this.clearDropTarget();
         this.currentDropTarget = element;
         this.currentDropTarget.classList.add("drop-target");
      } else {
         console.error(`target div has to be a list view item!`);
      }
   }
   private setDropLocationHigh(element: HTMLElement) {
      if (element.classList.contains("drop-location")) {
         this.clearDropLocationHigh();
         this.currentDropLocation = element;
         this.currentDropLocation.classList.add("highlight");
      } else {
         console.error(`location div has to be a drop-location!`);
      }
   }
}
