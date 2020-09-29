import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'expanding-panels',
  templateUrl: './expanding-panels.component.html',
  styleUrls: ['./expanding-panels.component.scss']
})
export class ExpandingPanelsComponent implements OnInit, AfterViewInit {
   @ContentChild('leftPanelTemplate', { static: false, read: TemplateRef }) leftPanelTemplate: TemplateRef<any>; // used by [ngTemplateOutlet]
   @ContentChild('rightPanelTemplate', { static: false, read: TemplateRef }) rightPanelTemplate: TemplateRef<any>; // used by [ngTemplateOutlet]
   @ViewChild('slider', { static: false }) sliderRef: ElementRef;
   private slider: HTMLDivElement;
   private sliderDownOffsetX: number;
   private leftPaneWidth = 200;
   private leftPanelWidthAtSlideStart = 0;
  constructor() { }

  ngOnInit() {
  }
   ngAfterViewInit() {
      this.slider = this.sliderRef.nativeElement;
   }
   getColumnTemplate() {
      return `${this.leftPaneWidth}px auto 1fr`;
      //return "200px auto 1fr";
   }
   onSeparatorPointerDown(e: PointerEvent) {
      //console.log(`onPointerDown at ${e.clientX}`);
      this.slider.setPointerCapture(e.pointerId);
      this.leftPanelWidthAtSlideStart = this.leftPaneWidth;
      this.sliderDownOffsetX = e.clientX;
      this.slider.onpointermove = (e) => this.slide(e);
   }
   onSeparatorPointerUp(e: PointerEvent) {
      //console.log("onPointerUp");
      this.slider.onpointermove = null;
      this.slider.releasePointerCapture(e.pointerId);
   }
   private slide(e: PointerEvent) {
      let offset = e.clientX - this.sliderDownOffsetX;
      this.leftPaneWidth = this.leftPanelWidthAtSlideStart + offset;
      //console.log(`${offset}`);
   }
}
