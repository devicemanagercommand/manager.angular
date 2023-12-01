import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaderService } from '../shared/http.header.service'
import { UserInfoModel } from '../../models/user/user-info.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpAuthService } from './http.auth.service';
import { ContactModel } from '../../models/home/contact.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  sendContactMessage(model: ContactModel) {
    const jsonContentTypeHeader = this.httpHeaderService.jsonContentType();
    const body = JSON.stringify(model);

    return this.http.post("/api/identity/user/contact", body, { headers: jsonContentTypeHeader })
  }

  getSavedInfo(): UserInfoModel {
    return this.currentUserSubject.value;
  }

  private currentUserSubject: BehaviorSubject<UserInfoModel>;
  private userInfo: Observable<UserInfoModel>;

  constructor(
    private http: HttpClient,
    private httpAuth: HttpAuthService,
    private httpHeaderService: HttpHeaderService) {
    console.log("User.Service.constructor");

    this.currentUserSubject = new BehaviorSubject<UserInfoModel>(JSON.parse(localStorage.getItem('userInfo')));
    this.userInfo = this.currentUserSubject.asObservable();
  }

  signUp(signUpDTO: SignUpDTO) {
    const jsonContentTypeHeader = this.httpHeaderService.jsonContentType();
    const body = JSON.stringify(signUpDTO);
    console.log("Sending body:", body);

    return this.http.post("/api/identity/user/signup", body, { headers: jsonContentTypeHeader })
  }

  passwordForgot(passwordForgot: PasswordForgotDTO) {
    const jsonContentTypeHeader = this.httpHeaderService.jsonContentType();
    const body = JSON.stringify(passwordForgot);
    console.log("UserService.passwordForgot()", body);

    return this.http.post("/api/identity/user/password/forgot", body, { headers: jsonContentTypeHeader })
  }

  passwordRecovery(passowrdRecovery: PasswordRecoveryDTO) {
    const jsonContentTypeHeader = this.httpHeaderService.jsonContentType();
    const body = JSON.stringify(passowrdRecovery);
    console.log("UserService.passwordRecovery()", body);
    return this.http.post("/api/identity/user/password/recovery", body, { headers: jsonContentTypeHeader })
  }

  getInfo(): Observable<UserInfoModel> {
    console.log("UserService.GetInfo()");

    return this.httpAuth.post<UserInfoModel>("/api/identity/user/info", null)
      .pipe(
        map(userInfo => {

          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          this.currentUserSubject.next(userInfo);

          return userInfo;
        }));
  }
}

export class SignUpDTO {
  user: string;
  name: string;
  password: string;
  mail: string;
  captchaResponse: string;
}

export class PasswordForgotDTO {
  mail: string;
  captchaResponse: string;
}

export class PasswordRecoveryDTO {
  password: string;
  retypePassword: string;
  tocken: string; /*User Identifier Validation*/
  userId: number; /*User identification*/
  message: string;
  isValid: boolean;
  isFromMail: boolean;
  captchaResponse: string;
}
