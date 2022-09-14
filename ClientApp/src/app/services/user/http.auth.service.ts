import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { HttpHeaderService } from '../shared/http.header.service'

@Injectable({
  providedIn: 'root',
})
export class HttpAuthService {

  constructor(
    private httpHeaderService: HttpHeaderService,
    private httpClient: HttpClient,
  ) {
  }

  get<T>(endpoint: string): Observable<T> {
    let headers = this.httpHeaderService.socialLoginId(null);
    headers = this.httpHeaderService.token(headers);
    headers = this.httpHeaderService.tokenId(headers);
    headers = this.httpHeaderService.accessToken(headers);
    return this.httpClient.get<T>(endpoint, { headers: headers });
  }

  post<T>(endpoint: string, body: string): Observable<T> {
    let headers = this.httpHeaderService.jsonContentType();
    headers = this.httpHeaderService.socialLoginId(headers);
    headers = this.httpHeaderService.token(headers);
    headers = this.httpHeaderService.tokenId(headers);
    headers = this.httpHeaderService.accessToken(headers);
    return this.httpClient.post<T>(endpoint, body, { headers: headers })
  }

}
