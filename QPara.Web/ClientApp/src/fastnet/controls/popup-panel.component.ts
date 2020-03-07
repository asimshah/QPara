
import { Component, OnInit, HostBinding, HostListener, Input, ElementRef } from '@angular/core';

@Component({
    selector: 'popup-panel',
    templateUrl: './popup-panel.component.html',
    styleUrls: ['./popup-panel.component.scss']
})
export class PopupPanelComponent implements OnInit {
    @HostBinding("style.top") y = "0px";
    @HostBinding("style.left") x = "0px";
    @HostBinding("style.visibility") visibility = "hidden";
    //@Input() @HostBinding("style.width") width = "200px";
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
        //console.log(`popuppanel @ (${this.x}, ${this.y})`);
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
