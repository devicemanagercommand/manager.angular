import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ResultMessageDTO } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {


  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  closeSimbol = "X";
  s: MatSnackBarRef<TextOnlySnackBar>

  constructor(public snackBar: MatSnackBar) {
    console.log("Message.Service.constructor");
  }

  Success(message: string) {
    this.s = this.snackBar.open(message, this.closeSimbol);
    this.s.onAction().subscribe(() => {
      this.s.dismiss();
    });

  }

  Warn(message: string) {
    this.s = this.snackBar.open(message, this.closeSimbol);
    this.s.onAction().subscribe(() => {
      this.s.dismiss();
    });
  }

  Danger(message: string) {
    this.s = this.snackBar.open(message, this.closeSimbol);
    this.s.onAction().subscribe(() => {
      this.s.dismiss();
    });
  }

  Info(message: any) {
    this.s = this.snackBar.open(message, this.closeSimbol);
    this.s.onAction().subscribe(() => {
      this.s.dismiss();
    });
  }

  Error(error: any) {
    const options: MatSnackBarConfig = {
      panelClass: ["service-snack-error"],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    }

    if (error.error) {

      if (error.error.error_description)//IdentityServer
      {
        this.s = this.snackBar.open(error.error.error_description, this.closeSimbol, options);
      } else if (error.status) {
        this.s = this.snackBar.open(error.message, this.closeSimbol, options);
      } else {
        const resultMessage = error.error as ResultMessageDTO;
        this.s = this.snackBar.open(resultMessage.message, this.closeSimbol, options);
      }
    }
    else if (error.message) {
      this.s = this.snackBar.open(error.message, this.closeSimbol, options);
    }
    else {
      this.s = this.snackBar.open(error, this.closeSimbol, options);
      console.error(error);
    }

    this.s.onAction().subscribe(() => {
      this.s.dismiss();
    });

  }

  Close() {
    if (this.s) {
      this.s.dismiss();
    }
  }

}
