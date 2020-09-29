import { Directive, HostListener, ComponentRef, ViewContainerRef, ComponentFactoryResolver, Input } from '@angular/core';
import { TooltipContentComponent } from "./tooltip-content.component";

/**
 * [tooltip] set this equal to a string or to the template variable of an instance of <tooltip-content>
 * [tooltipPlacement] a value such as 'top-left' (above target with left edge aligned to the left of the target) (see code for others)
 * [delay] delay in milliseconds before showing tooltip, default is 1500
 * */

@Directive({
  selector: '[tooltip]'
})
export class TooltipDirective {
   @Input("tooltip") content: string | TooltipContentComponent;
   @Input() tooltipDisabled: boolean;
   @Input() offset = 20;
   @Input() delay = 1500;// always in milliseconds
  // @Input() tooltipAnimation: boolean = true;
   //@Input() tooltipPlacement: "top" | "bottom" | "left" | "right" = "bottom";
   // the first four below have a default second part of "center", e.g. "top" == "top-center"
   @Input() tooltipPlacement: "top" | "bottom" | "left" | "right" | "top-left" | "bottom-left" | "left-top" | "left-bottom" = "bottom";
   private tooltip: ComponentRef<TooltipContentComponent>;
   private visible: boolean;

   constructor(private viewContainerRef: ViewContainerRef,
      private resolver: ComponentFactoryResolver) {
   }
   @HostListener("focusin")
   @HostListener("mouseenter")
   show(): void {
      if (this.isMobileDevice() || this.tooltipDisabled || this.visible)
         return;

      this.visible = true;
      if (typeof this.content === "string") {
         const factory = this.resolver.resolveComponentFactory(TooltipContentComponent);
         if (!this.visible)
            return;

         this.tooltip = this.viewContainerRef.createComponent(factory);
         this.tooltip.instance.hostElement = this.viewContainerRef.element.nativeElement;
         this.tooltip.instance.content = this.content as string;
         this.tooltip.instance.placement = this.tooltipPlacement;
         this.tooltip.instance.positionOffset = this.offset;
         this.tooltip.instance.delay = this.delay;
         //this.tooltip.instance.animation = this.tooltipAnimation;
      } else {
         const tooltip = this.content as TooltipContentComponent;
         tooltip.hostElement = this.viewContainerRef.element.nativeElement;
         tooltip.placement = this.tooltipPlacement;
         tooltip.positionOffset = this.offset;
         tooltip.delay = this.delay;
         //tooltip.animation = this.tooltipAnimation;
         tooltip.show();
      }
   }

   @HostListener("focusout")
   @HostListener("mouseleave")
   hide(): void {
      if (!this.visible)
         return;

      this.visible = false;
      if (this.tooltip)
         this.tooltip.destroy();

      if (this.content instanceof TooltipContentComponent)
         (this.content as TooltipContentComponent).hide();
   }
   isMobileDevice() {
      return matchMedia("only screen and (max-width: 760px)").matches;
   }
}
/*
 * 29June2020 - these are the settings I have tried
 * the remainder (ones on the right somewhere) i did not try as there was
 * no room in the device playlist componnent
 * 
 *                     __________         ___________
 *                     |top-left |       |top-center |
 *                     |_________|_______|___________|______
 *                     |_________________+__________________|
 *                     |bottom-left |    |bottom-center |
 *                     |____________|    |______________|
 *
 *                       _____________
 *                      |left-center  |____________________________________
 *                      |             |                 +                  |
 *                      |             |_________________+__________________|
 *                      |_____________|
 *       
 *                       _____________ ____________________________________
 *                      |left-top     |                 +                  |
 *                      |             |_________________+__________________|
 *                      |_____________|
 *
 *                                     ____________________________________
 *                                    |                 +                  |
 *                       _____________|_________________+__________________|
 *                      |left-bottom  |
 *                      |             |
 *                      |_____________|
 *
 *
 */
