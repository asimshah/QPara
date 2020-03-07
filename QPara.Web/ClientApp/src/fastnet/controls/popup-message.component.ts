import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PopupDialogComponent } from './popup-dialog.component';
import { DialogResult } from '../core/core.types';



/** Sets options for a <popup-message> (PopupMessageComponent) */
export class PopupMessageOptions {
    /** optional caption = default is "System Message" */
    caption?: string;
    okLabel?: string;
    cancelLabel?: string;
    allowCancel?: boolean;
    warning?: boolean;
    error?: boolean;
    width?: number; // always px
}

/** Called when PopupMessageComponent closes. Use when opening a PopupMessageComponent. */
export type PopupMessageCloseHandler = (r: DialogResult) => void;

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
        //if (typeof this.messages === "string") {
        //    this.isSingleMessage = true;
        //} else {
        //    this.isSingleMessage = false;
        //}
    }
    /**
     * Opens a <popup-message> custom component
     * @param messages can be a single string or an array of strings
     * @param onClose called when the popup messages closes
     * @param options sets options such captions, buttons labels, cancel allowed, etc
     */
    open(messages: string | string[], onClose: PopupMessageCloseHandler, options?: PopupMessageOptions) {
        console.log("open");
        this.messages = messages;
        if (typeof this.messages === "string") {
            this.isSingleMessage = true;
        } else {
            this.isSingleMessage = false;
        }
        this.closeHandler = onClose;
        this.popup.unsetWidth();
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
                this.popup.setWidth(options.width);
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
