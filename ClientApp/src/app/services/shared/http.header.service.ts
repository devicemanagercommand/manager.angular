import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HttpHeaderService {

  socialLoginId(headers: HttpHeaders) {
    const socialLoginId = localStorage.getItem("SocialLoginId");
    if (headers) {
      return headers.append("SocialLoginId", socialLoginId)
    }
    else {
      return new HttpHeaders().set("SocialLoginId", socialLoginId);
    }
  }

  tokenId(headers: HttpHeaders) {
    const tokenId = localStorage.getItem("tokenId");
    if (headers) {
      return headers.append("tokenId", tokenId)
    }
    else {
      return new HttpHeaders().set("tokenId", tokenId);
    }
  }

  token(headers: HttpHeaders) {
    const token = localStorage.getItem("token");
    if (headers) {
      return headers.append("token", token)
    }
    else {
      return new HttpHeaders().set("token", token);
    }
  }

  accessToken(headers: HttpHeaders) {

    const accessToken = localStorage.getItem('access_token');
    if (headers) {
      return headers.append("Authorization", `Bearer ${accessToken}`)
    }
    else {
      return new HttpHeaders().set("Authorization", `Bearer ${accessToken}`);
    }
  }

  jsonContentType(): HttpHeaders {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');
    return headers;
  }
}
