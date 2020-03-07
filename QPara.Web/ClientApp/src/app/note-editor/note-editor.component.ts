import { Component, ViewChild } from "@angular/core";
import { DialogResult } from "../../fastnet/core/core.types";
import { PopupDialogComponent } from "../../fastnet/controls/popup-dialog.component";

export class NoteEditorResult {
    cancelled: boolean = false;
    text: string;
}

@Component({
    selector: 'qp-note-editor',
    templateUrl: './note-editor.component.html',
    styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent {
    @ViewChild(PopupDialogComponent, {static: false}) popup: PopupDialogComponent;
    text: string = "";
    open(onClose: (r: NoteEditorResult) => void) {
        this.text = "";
        this.popup.open((r: NoteEditorResult) => {
            onClose(r);
        });
    }
    onSave() {
        let r = new NoteEditorResult();
        r.text = this.text;
        if (r.text.trim().length === 0) {
            r.cancelled = true;
        }
        this.popup.close(r);
    }
    onClose() {
        let r = new NoteEditorResult();
        r.cancelled = true;
        this.popup.close(r);
    }
}
