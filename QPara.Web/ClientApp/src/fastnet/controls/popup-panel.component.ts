
import { Component, OnInit, HostBinding, HostListener, Input, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'popup-panel',
    templateUrl: './popup-panel.component.html',
    styleUrls: ['./popup-panel.component.scss']
})
export class PopupPanelComponent implements OnInit {
    @HostBinding("style.top") y = "0px";
    @HostBinding("style.left") x = "0px";
    @HostBinding("style.right") r = "10px";
    @HostBinding("style.width") boundWidth;
    @HostBinding("style.visibility") visibility = "hidden";
    @Input() @HostBinding("style.width") width = "auto";


    constructor(public elem: ElementRef) { }

    ngOnInit() {
    }

    open(e: MouseEvent, alignRight = false) {
        let htmlElement: HTMLElement = this.elem.nativeElement;
        let rect = htmlElement.getBoundingClientRect();
        if (alignRight) {
            this.x = `${e.pageX - rect.width}px`;
        } else {
            this.x = `${e.pageX}px`;
        }
        this.y = `${e.pageY}px`;

        this.visibility = "visible";
        e.stopPropagation();
    }
    
    close() {
        this.visibility = "hidden";
    }

    @HostListener('document:click')
    public onDocumentClick() {
        if (this.visibility === "visible") {
            this.close();
        }
    }
}
