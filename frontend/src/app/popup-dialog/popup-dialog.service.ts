import { Observable } from 'rxjs/Rx';
import { PopupDialogComponent } from './popup-dialog.component';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable()
export class PopupDialogService {

    constructor(private dialog: MdDialog) { }

    public confirm(title: string, message: string): Observable<boolean> {

        let dialogRef: MdDialogRef<PopupDialogComponent>;

        dialogRef = this.dialog.open(PopupDialogComponent);
        dialogRef.componentInstance.isConfirm = true;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        return dialogRef.afterClosed();
    }

    public display(title: string, message: string, moreInfoLink: string, moreInfoMessage: string): void {
        let dialogRef: MdDialogRef<PopupDialogComponent>;

        dialogRef = this.dialog.open(PopupDialogComponent);
        dialogRef.componentInstance.isConfirm = false;
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;

        dialogRef.componentInstance.hasMoreInfoLink = true;
        dialogRef.componentInstance.moreInfoLink = moreInfoLink;
        dialogRef.componentInstance.moreInfoMessage = moreInfoMessage;

        return;
    }
}