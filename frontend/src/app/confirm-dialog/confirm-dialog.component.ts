import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['../../app/confirm-dialog/confirm-dialog.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})
export class ConfirmDialog {

    public title: string;
    public message: string;

    constructor(
        public dialogRef: MdDialogRef<ConfirmDialog>
        ) { }
}