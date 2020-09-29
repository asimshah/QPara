import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PopupDialogComponent } from './popup-dialog.component';
import { DialogResult } from '../core/core.types';



/** Sets options for a <popup-message>
 * all properties are optional
 * caption - sets the caption
 * okLabel - sets the OK button label
 * cancelLabel - sets the Cancel utton label
 * allowCancel - if true, shows the Cancel button (default for this is false)
 * warning - sets warning chrome
 * error - sets error chrome
 * width - sets the width of the dialog, default is 370px
 * */
export class PopupMessageOptions {
   caption?: string;
   okLabel?: string;
   cancelLabel?: string;
   allowCancel?: boolean;
   warning?: boolean;
   error?: boolean;
   width?: number; // always px
}

/** 
 * Handler called on closure of a PopupMessageComponent (<popup-message>)
 * called with a DialogResult
 * */
export type PopupMessageCloseHandler = (r: DialogResult) => void;
/**
 * Popup Message that return a DialogResult
 * [width] - width of dialog, default 370px
 * [caption] - dialog caption - default "System Message"
 * [warning] - if true, shows warning chrome, default is false
 * [error] - if true, shows the error chromw, default is false
 * */
@Component({
   selector: 'popup-message',
   templateUrl: './popup-message.component.html',
   styleUrls: ['./popup-message.component.scss']
})
export class PopupMessageComponent implements OnInit {
   PopupMessageResult: DialogResult;
   @ViewChild('popupdialog', { static: false }) popup: PopupDialogComponent;
   @Input() width: number = 370;
   @Input() caption: string = "System Message";
   okLabel: string = "OK";
   cancelLabel: string = "Cancel";
   allowCancel: boolean = false;
   messages: string | string[];
   @Input() warning: boolean = false;
   @Input() error: boolean = false;
   isSingleMessage: boolean = true;
   closeHandler: PopupMessageCloseHandler;
   constructor() {

   }
   ngOnInit(): void {
   }
   /**
    * Opens a <popup-message> custom component
    * @param messages can be a single string or an array of strings
    * @param onClose called when the popup messages closes
    * @param options sets options such captions, buttons labels, cancel allowed, etc
    */
   open(messages: string | string[], onClose: PopupMessageCloseHandler, options?: PopupMessageOptions) {
      //console.log("open");
      this.messages = messages;
      if (typeof this.messages === "string") {
         this.isSingleMessage = true;
      } else {
         this.isSingleMessage = false;
      }
      this.closeHandler = onClose;
      this.popup.width = this.width.toString();
      if (options) {
         if (options.caption) {
            this.caption = options.caption;
         }
         if (options.okLabel) {
            this.okLabel = options.okLabel;
         }
         if (options.cancelLabel) {
            this.cancelLabel = options.cancelLabel;
         }

         if (options.allowCancel) {
            this.allowCancel = options.allowCancel;
         }
         if (options.warning) {
            this.warning = options.warning;
         }
         if (options.error) {
            this.error = options.error;
         }
         if (options.width) {
            this.popup.width = options.width.toString();
            //  this.popup.setWidth(options.width);
         }
      }
      this.popup.open((a) => this.popupClosed(a));
   }
   onOk() {
      this.popup.close(DialogResult.ok);
   }
   onCancel() {
      this.popup.close(DialogResult.cancel);
   }

   popupClosed(arg: DialogResult): void {
      this.closeHandler(arg);
   }
}
