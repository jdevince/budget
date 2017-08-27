import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
    selector: 'popup-dialog',
    templateUrl: './popup-dialog.component.html',
    styleUrls: ['../../app/popup-dialog/popup-dialog.component.css'] //styleUrls doesn't accept root path: https://github.com/angular/angular/issues/4974
})
export class PopupDialogComponent {

    public title: string;
    public message: string;
    public moreInfoLink: string;
    public moreInfoMessage: string;
    
    public isConfirm: boolean;
    public hasMoreInfoLink: boolean;

    constructor(
        public dialogRef: MdDialogRef<PopupDialogComponent>
        ) { }
}