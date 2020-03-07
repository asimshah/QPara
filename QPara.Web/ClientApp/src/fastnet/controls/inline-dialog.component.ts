
import { Component, ViewEncapsulation } from '@angular/core';

import { DialogBase } from './dialog-base.type';


@Component({
    selector: 'inline-dialog',
    templateUrl: './inline-dialog.component.html',
    styleUrls: ['./inline-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InlineDialogComponent extends DialogBase  {

}


