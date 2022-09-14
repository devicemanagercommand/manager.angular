import { Injectable, Inject } from '@angular/core';
import { HttpHeaderService } from '../shared/http.header.service'
import { HttpAuthService } from '../user/http.auth.service'
import { Observable } from 'rxjs';
import { UserAuthService } from '../user/user.auth.service';
import { ResourceModel } from '../../models/device/settings/resource.model';
import { SharedUserModel } from '../../models/identity/shared-user-model';

  @Injectable({
    providedIn: 'root',
  })
export class ResourceService {
  constructor(
    private httpAuth: HttpAuthService,
    private userAuthService: UserAuthService,
    private httpHeaderService: HttpHeaderService,
  ) {
    console.log("ResrouceService.constructor");
  }

  getSharedUsers(resourceModel: ResourceModel): Observable<SharedUserModel[]> {
    const body = JSON.stringify(resourceModel);
    return this.httpAuth.post(`/api/identity/resource/sharedUsers`, body);
  }

  removeSharedUser(resourceModel: SharedUserModel): Observable<void> {
    const body = JSON.stringify(resourceModel);
    return this.httpAuth.post(`/api/identity/resource/removeSharedUser`, body);
  }

  save(resourceModel: ResourceModel) {
    const body = JSON.stringify(resourceModel);
    return this.httpAuth.post(`/api/identity/resource/save`, body);
  }
}

