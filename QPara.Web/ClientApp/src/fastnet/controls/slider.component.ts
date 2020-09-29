import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, forwardRef } from '@angular/core';
import { ControlBase } from './controlbase.type';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export type SliderValueSource = "user-action" | "current-change";
export class SliderValue {
   constructor(public value: number, public source: SliderValueSource = "current-change") {}
}

@Component({
   selector: 'slider',
   templateUrl: './slider.component.html',
   styleUrls: ['./slider.component.scss'],
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => SliderComponent),
         multi: true
      },
      {
         provide: ControlBase, useExisting: forwardRef(() => SliderComponent)
      }
   ]
})
export class SliderComponent /*extends ControlBase*/ implements OnInit, AfterViewInit {
   //ready = false;
   static index = 0;
   @ViewChild('bead', { static: false }) beadRef: ElementRef;
   @ViewChild('groove', { static: false }) grooveRef: ElementRef;
   @Input() canslide = true;
   @Input() minimum = 0;
   @Input() maximum = 1;
   @Input() get current() { return this._current; }
   set current(n: number) {
      this._current = n;
      if (this.afterViewInitHasOccurred === true) {
         this.onCurrentChange(n);
      }
   };

   @Output() currentChange = new EventEmitter<SliderValue>();
   @Input() canReposition = true;
   stdMinValue = 0;
   stdMaxValue = 1;
   stdCurrentValue: number = 0;
   isDragging = false;
   beadWidth = 0;
   beadLeftAtViewInit = 0;
   grooveWidth = 0;
   beadPosition: string = "0px";
   beadDownOffsetX: number;
   stdCurrentValueAtDragStart = 0;
   stdCurrentValueWhileDragging = 0;
   private bead: HTMLDivElement;
   private groove: HTMLDivElement;
   private afterViewInitHasOccurred = false;
   private _current: number;
   constructor() {
      SliderComponent.index++;
      this.stdCurrentValue = 0;
      this.current = this.minimum;
   }

   ngOnInit() {
   }

   ngAfterViewInit() {
      this.bead = this.beadRef.nativeElement;
      let cr = this.bead.getBoundingClientRect();
      this.beadWidth = cr.width;
      this.beadLeftAtViewInit = cr.left;
      this.groove = this.grooveRef.nativeElement;
      //console.log(`[${SliderComponent.index}] ngAfterViewInit(), grooveRef ${this.grooveRef ? 'exists' : 'not found'}`);
      this.afterViewInitHasOccurred = true;
   }
   isMobileDevice() {
      if (ControlBase.deviceSensitivity) {
         return matchMedia("only screen and (max-width: 760px)").matches;
      }
      return false;
   }
   onBeadPointerDown(e: PointerEvent) {
      this.isDragging = true;
      this.beadDownOffsetX = e.clientX;
      this.bead.setPointerCapture(e.pointerId);
      this.grooveWidth = this.groove.getBoundingClientRect().width;
      this.stdCurrentValueAtDragStart = this.stdCurrentValue;
      this.bead.onpointermove = (e) => this.slide(e);
   }
   onBeadPointerUp(e: PointerEvent) {
      this.bead.onpointermove = null;
      this.stdCurrentValue = this.stdCurrentValueWhileDragging;
      this.bead.releasePointerCapture(e.pointerId);
      this.current = this.getCurrentValue();
      this.isDragging = false;
      this.currentChange.next(new SliderValue(this.current, "user-action"));
   }
   private getCurrentValue() {
      let range = this.maximum - this.minimum;
      return this.stdCurrentValue * range + this.minimum;
   }
   private slide(e: PointerEvent) {
      let offset = e.clientX - this.beadDownOffsetX;// this.beadPositionAtDragStart;
      let offsetValue = this.stdCurrentValueAtDragStart + (offset / this.grooveWidth);
      if (offsetValue < 0) {
         offsetValue = 0;
         offset = 0;
      } else if (offsetValue > 1) {
         offsetValue = 1;
         offset = this.grooveWidth;
      }
      this.stdCurrentValueWhileDragging = offsetValue;
      this.beadPosition = this.calcBeadPosition(this.stdCurrentValueWhileDragging);
   }
   private calcBeadPosition(val: number) {
      let x = val * this.groove.getBoundingClientRect().width;
      let v = (x - (this.beadWidth / 2));
      return `${v}px`;
   }
   private onCurrentChange(v: number) {
      //console.log(`[${SliderComponent.index}] onCurrentChange(), v = ${v}, dragging ${this.isDragging}`);
      if (!this.isDragging) {
         let range = this.maximum - this.minimum;
         let x = (v - this.minimum) / range;
         if (x < 0.0) {
            this.stdCurrentValue = 0.0;
         } else if (x > 1.0) {
            this.stdCurrentValue = 1.0;
         } else {
            this.stdCurrentValue = x;
         }
         this.beadPosition = this.calcBeadPosition(this.stdCurrentValue);
         this.currentChange.next(new SliderValue(this.getCurrentValue()));
      } else {
         
      }
   }
}
