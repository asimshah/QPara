import { InputControlBase } from "./inputcontrolbase";
import { Input, Renderer2, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, EventEmitter, Output } from "@angular/core";
import { ListItem } from "../core/core.types";


export class DropdownBase extends InputControlBase implements OnDestroy, AfterViewChecked, AfterViewInit {
  private static allDropdownControls: DropdownBase[] = [];
  showDropdown: boolean = false;
  @Input() maxrows: number = 5;
  @Input() items: ListItem<any>[] | string[];
  @Output() selectionchanged = new EventEmitter<ListItem<any> | string>();
  filteredItems: ListItem<any>[] | string[];
  inputElementText: string = '';
  @ViewChild('droppanel', { static: false }) dropPanel: ElementRef;
  @ViewChild('textBox', { static: false }) textBox: ElementRef;
  public itemType: 'string' | 'listitem' = 'listitem';
  private dropPanelWidth: number;
  private dropPanelHeight: number;
   constructor(elem: ElementRef, private renderer: Renderer2) {
    super(elem);
    //this.setReference("combo-box");
    DropdownBase.allDropdownControls.push(this);
  }
  writeValue(obj: any): void {
    super.writeValue(obj);
    if (obj) {
      this.inputElementText = this.itemType === 'string' ? obj : obj.name;
    }
  }
  ngAfterViewInit() {
    this.setItemsType();
    this.matchItems();
    this.computeDropPanelSize();
    super.ngAfterViewInit();
  }
  ngAfterViewChecked() {
    //console.log(`ngAfterViewChecked()`);
    if (this.showDropdown === true) {
      // it is about to open
      this.setDropPanelSize();
    }

  }
  ngOnDestroy() {
    let index = DropdownBase.allDropdownControls.findIndex(x => x === this);
    if (index >= 0) {
      DropdownBase.allDropdownControls.splice(index, 1);
    }
  }
  onDownIconClick() {
    if (this.showDropdown) {
      this.closeDropDown();
    } else {
      this.openDropdown();
    }
  }
  isOpen(): boolean {
    return this.showDropdown === true;
  }
  onItemClick(e: Event, item: ListItem<any> | string) {
    this.writeValue(item);
  }
  stopEvent(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }
  @HostListener('document:click')
  public externalEvent() {
    this.closeDropDown();
  }
  @HostListener('window:resize', ['$event.target'])
  onResize() {
    //console.log(`onResize()`);
    this.computeDropPanelSize();
    if (this.showDropdown === true) {
      // it is about to open
      this.setDropPanelSize();
    }
  }
  private selectItem(item: ListItem<any> | string) {
    this.inputElementText = '';
    setTimeout(() => {
      if (this.itemType === 'string') {
        this.inputElementText = <string>item;
      } else {
        this.inputElementText = (<ListItem<any>>item).name;
      }
      this.writeValue(item);
      this.matchItems();
      this.selectionchanged.emit(item);
      this.closeDropDown();
    }, 0);
  }
  private openDropdown(initialState = true) {
    this.closeOthers();
    this.showDropdown = true;
    setTimeout(() => {
      if (initialState === true) {
        this.matchItems();
      }
      this.computeDropPanelSize();
      this.setDropPanelSize();
      let currentElement = this.findCurrentDropItem();
      if (currentElement !== null) {
        currentElement.scrollIntoView();
      }
    }, 0);
  }
  private findCurrentDropItem(): HTMLElement | null {
    if (this.value) {
      let currentText = this.value.name;
      let items = this.dropPanel.nativeElement.querySelectorAll('.drop-item');
      let r = null;
      for (let item of items) {
        let text = item.innerHTML;
        if (currentText === text) {
          r = item;
          break;
        }
      }
      return r!;
    }
    return null;
  }
  private closeDropDown() {
    //if (this.userTyping === true) {
    //  this.selectItem(this.value);
    //}
    setTimeout(() => {
      this.showDropdown = false;
    }, 0);

  }
  private closeOthers() {
    for (let control of DropdownBase.allDropdownControls) {
      if (control !== this) {
        if (control.showDropdown === true) {
          control.closeDropDown();
        }
      }
    }
  }
  private matchItems(filter: string = '') {
    if (this.itemType === 'string') {
      let items = <string[]>this.items;
      this.filteredItems = items.filter(x => x.toLowerCase().startsWith(filter.toLowerCase()));
    } else {
      let items = <ListItem<any>[]>this.items;
      this.filteredItems = items.filter(x => x.name.toLowerCase().startsWith(filter.toLowerCase()));
    }
  }
  private setItemsType() {
    if (!this.items || this.items.length == 0) {
      console.error("combo-box - no items defined");
    }
    let first = this.items[0];
    if (typeof first === "string") {
      this.itemType = 'string';
    }
  }
  private computeDropPanelSize() {
    this.dropPanelWidth = this.textBox.nativeElement.clientWidth;
    let di = document.querySelector('.drop-item');
    let rows = Math.min(this.maxrows, this.filteredItems.length);
    if (di) {
      this.dropPanelHeight = (rows * di.clientHeight);// + (this.padding * 2);
    }
  }
  private setDropPanelSize() {
    this.renderer.setStyle(this.dropPanel.nativeElement, 'width', `${this.dropPanelWidth}px`);
    this.renderer.setStyle(this.dropPanel.nativeElement, 'height', `${this.dropPanelHeight}px`);
    //console.log(`panel size reset`);
  }
}
