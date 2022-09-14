import { Component, Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LangService } from 'src/app/services/shared/lang.service';

export interface DialogData {
  title: string;
  message: string;
  no: string;
  yes: string;
  type: DialogType;
}

export enum DialogType {
  Error, Info, Warning, Question, None
}

@Component({
  selector: 'dmc-dialog',
  templateUrl: 'dialog.component.html',
  styleUrls: ['dialog.component.scss'],
})
export class DMCDialogComponent {

  public dialogType = DialogType;

  constructor(
    public dialogRef: MatDialogRef<DMCDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    console.log("DMCDialogCompoenent.contructor()");
    console.log(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}


@Injectable({
  providedIn: 'root',
})
export class DialogService {

  constructor(
    private rs: LangService,
    private dialog: MatDialog
  ) {
  }

  show(message: string, title: string, type: DialogType): Observable<boolean>  {

    const dialogRef = this.dialog.open(DMCDialogComponent, {
      width: '400px',
      data: { title: title, message: message, type: type, yes: this.rs.Resource("LabelOk") }
    });

    return dialogRef.afterClosed().pipe(
      map(result => {
        return result as boolean;
      }));
  }

  confirm(message: string, title: string): Observable<boolean> {

    const dialogRef = this.dialog.open(DMCDialogComponent, {
      width: '400px',
      data: { title: title, message: message, type: DialogType.Question, yes: this.rs.Resource("LabelYes"), no: this.rs.Resource("LabelNo") }
    });

    return dialogRef.afterClosed().pipe(
      map(result => {
        return result as boolean;
      }));
  }
}
