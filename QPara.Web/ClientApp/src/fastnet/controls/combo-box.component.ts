
import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, Input, AfterViewChecked, HostListener, OnDestroy, forwardRef, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { InputControlBase, ControlBase } from './controlbase.type';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ListItem } from '../core/core.types';

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
export class ComboBoxComponent extends InputControlBase implements AfterViewInit, AfterViewChecked, OnDestroy {
    private static allComboBoxes: ComboBoxComponent[] = [];
    showDropdown: boolean = false;
    @Input() maxRows: number = 5;
    @Input() items: ListItem<any>[];
    @Input() compact: boolean = false;
    @Input() aligncentre: boolean = false;
    @Output() selectionchanged = new EventEmitter<ListItem<any>>();
    filteredItems: ListItem<any>[];
    @ViewChild('textBox', { static: false }) textBox: ElementRef;
    @ViewChild('droppanel', { static: false }) dropPanel: ElementRef;
    inputElementText: string = '';
    private padding: number = 3.5;
    private rowHeight = 20;
    private dropPanelWidth: number;
    private dropPanelHeight: number;
    private inputElementTextValid: boolean = false;
    private userTyping = false;
    constructor(private renderer: Renderer2) {
        super();
        this.setReference("combo-box");
        ComboBoxComponent.allComboBoxes.push(this);
        //console.log(`constructor: ComboBoxComponent.allComboBoxes length now ${ComboBoxComponent.allComboBoxes.length}`);
    }
    writeValue(obj: any): void {
        super.writeValue(obj);
        if (obj) {
            this.inputElementText = obj.name;
        }
    }
    ngOnDestroy() {
        let index = ComboBoxComponent.allComboBoxes.findIndex(x => x === this);
        if (index >= 0) {
            ComboBoxComponent.allComboBoxes.splice(index, 1);
        }
        //console.log(`ngOnDestroy(): ComboBoxComponent.allComboBoxes length now ${ComboBoxComponent.allComboBoxes.length}`);
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
    ngAfterViewChecked() {
        //console.log(`ngAfterViewChecked()`);
        if (this.showDropdown === true) {
            // it is about to open
            this.setDropPanelSize();
        }

    }

    ngAfterViewInit() {
        //console.log(`ngAfterViewInit()`);
        this.matchItems();
        this.computeDropPanelSize();
        super.ngAfterViewInit();
    }
    onItemClick(e: Event, item: ListItem<any>) {
        //console.log(`onItemClick: ${JSON.stringify(item, null, 2)}`);
        this.selectItem(item);
    }
    onLocalInput(text: string) {
        //console.log(`onInput(): ${text}, inputElementText = ${this.inputElementText}`);
        super.onInput();
        this.userTyping = true;
        this.matchItems(text);

        if (this.showDropdown) {
            this.computeDropPanelSize();
            this.setDropPanelSize();
        } else {
            this.openDropdown(false);
        }
        this.inputElementTextValid = false;
        if (this.filteredItems.length === 1) {
            this.selectItem(this.filteredItems[0]);
            this.inputElementTextValid = true;
        }

    }
    onDownIconClick() {
        //console.log(`onDownIconClick()`);
        //this.showDropdown = !this.showDropdown;
        //if (this.showDropdown) {
        //    this.closeOthers();
        //}
        if (this.showDropdown) {
            this.closeDropDown();
        } else {
            this.openDropdown();

        }

    }
    isOpen(): boolean {
        return this.showDropdown === true;
    }
    stopEvent(e: Event) {
        e.stopPropagation();
        e.preventDefault();
    }
    @HostListener('document:click')
    public externalEvent() {
        //console.log(`externalEvent`);
        this.closeDropDown();
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
            currentElement.scrollIntoView();
        }, 0);
    }
    private closeDropDown() {
        if (this.userTyping === true) {
            this.selectItem(this.value);
        }
        setTimeout(() => {
            this.showDropdown = false;
        }, 0);

    }
    private closeOthers() {
        for (let control of ComboBoxComponent.allComboBoxes) {
            if (control !== this) {
                if (control.showDropdown === true) {
                    control.closeDropDown();
                }
            }
        }
    }
    private selectItem(item: ListItem<any>) {
        this.inputElementText = '';
        setTimeout(() => {
            this.inputElementText = item.name;
            this.writeValue(item);
            this.matchItems();
            this.userTyping = false;
            //console.log(`selectItem: ${JSON.stringify(item)}`);
            this.selectionchanged.emit(item);
            this.closeDropDown();
        }, 0);

    }
    private matchItems(filter: string = '') {
        this.filteredItems = this.items.filter(x => x.name.toLowerCase().startsWith(filter.toLowerCase()));
    }
    private computeDropPanelSize() {
        this.dropPanelWidth = this.textBox.nativeElement.clientWidth;
        let rows = Math.min(this.maxRows, this.filteredItems.length);
        this.dropPanelHeight = (rows * this.rowHeight);// + (this.padding * 2);
        //console.log(`panel size is now ${this.dropPanelWidth}w, ${this.dropPanelHeight}h`);
    }
    private setDropPanelSize() {
        this.renderer.setStyle(this.dropPanel.nativeElement, 'width', `${this.dropPanelWidth}px`);
        this.renderer.setStyle(this.dropPanel.nativeElement, 'height', `${this.dropPanelHeight}px`);
        //console.log(`panel size reset`);
    }
    private findCurrentDropItem(): HTMLElement {
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
}
