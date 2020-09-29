
import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, Input, AfterViewChecked, HostListener, OnDestroy, forwardRef, OnChanges, SimpleChanges, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import { ControlBase } from './controlbase.type';
import { InputControlBase } from "./inputcontrolbase";

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem } from '../core/core.types';
import { TextInputControl } from './text-input.component';
import { ListComponent } from './list.component';

/** allows selection from a list of items using a list view in dropdown mode
 */
@Component({
  selector: 'combo-box',
  templateUrl: './combo-box.component.html',
  styleUrls: ['./combo-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboBoxComponent),
      multi: true
    },
    {
      provide: ControlBase, useExisting: forwardRef(() => ComboBoxComponent)
    }
  ]
})
export class ComboBoxComponent extends InputControlBase implements AfterViewInit,  OnDestroy {
  private static allComboBoxes: ComboBoxComponent[] = [];
  showListView: boolean = false;
  @Input() smartFilter = false; // ** NB ** items must be string[] for smartfilter to work (but it might work with objects having toString()??)
  @Input() items: any[] = []; 
  @Input() maxrows: number = 5;
  @Input() compact: boolean = false; // used by <date-input /> to reduce the down icon size
  @Input() aligncentre: boolean = false;// used by <date-input /> to align the year number in the month display
  @Output() selectionchanged = new EventEmitter<any>();
  filteredItems: { name: string, index: number }[];
  private prefix = "";
  private guard = false;
  constructor(elem: ElementRef, private renderer: Renderer2) {
    super(elem);
    this.setReference("combo-box");
    ComboBoxComponent.allComboBoxes.push(this);
  }

  ngOnDestroy() {
    let index = ComboBoxComponent.allComboBoxes.findIndex(x => x === this);
    if (index >= 0) {
      ComboBoxComponent.allComboBoxes.splice(index, 1);
    }
    //console.log(`ngOnDestroy(): ComboBoxComponent.allComboBoxes length now ${ComboBoxComponent.allComboBoxes.length}`);
  }


  ngAfterViewInit() {
    this.filterItems();
    this.closeListView();
    super.ngAfterViewInit();
  }

  filterItems() {
    this.filteredItems = [];
    let i = 0;
    for (let item of this.items) {
      if ( this.smartFilter && this.prefix && this.prefix.length > 0) {
        if (item.toString().toLowerCase().startsWith(this.prefix)) {
          // <list-view> default displayProperty is 'name'
          this.filteredItems.push({ 'name': item, index: i });
        }
      } else {
        // <list-view> default displayProperty is 'name' - item needs to have a toString() method for this to work!!
        this.filteredItems.push({ 'name': item, index: i });
      }
      ++i;
    }
  }
  onListIndexChanged(index: number) {
    this.guard = true;
    console.log(`combo-box changed: index ${index},item ${this.items[index]}`);
    let fi = this.filteredItems[index];
    this.writeValue(this.items[fi.index]);
    setTimeout(() => {
      this.closeListView();
      this.guard = false;
    }, 0);
  }
  onTextChange() {
    //NB 1: this method is only called if the user has typed into the <text-box/>
    // **NB 2 ** this method is bound to (ngModelChange). Binding it to (change) did not work properly (required second click on list item)
    if (this.smartFilter) {
      if (this.guard == false) {
        this.openListView();
        console.log(`onTextChange(): value is ${this.value}`);
        this.prefix = (<string>this.value).toLowerCase();
        this.filterItems();
      }
    }
  }
  onDownIconClick() {
    if (this.showListView) {
      this.closeListView();
    } else {
      this.openListView();

    }

  }
  isOpen(): boolean {
    return this.showListView === true;
  }
  stopEvent(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }
  @HostListener('document:click')
  public externalEvent() {
    //console.log(`externalEvent`);
    this.closeListView();
  }
  private openListView(initialState = true) {
    this.closeOthers();
    this.showListView = true;
  }
  private closeListView() {
    this.showListView = false;
  }
  private closeOthers() {
    for (let control of ComboBoxComponent.allComboBoxes) {
      if (control !== this) {
        if (control.showListView === true) {
          control.closeListView();
        }
      }
    }
  }
}
