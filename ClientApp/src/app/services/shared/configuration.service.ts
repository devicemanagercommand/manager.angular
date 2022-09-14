import {
  Injectable, Inject
} from '@angular/core';

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BasicConfigurationModel } from '../../models/global/basic-configuration.model'
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {


  public model: BasicConfigurationModel


  constructor(private http: HttpClient,
    private location: Location
  ) {
    console.log("BasicConfigurationModel.Constructor");
  }

  getConfiguration() {
    return this.http.get<BasicConfigurationModel>('/api/identity/user/configuration').pipe(
      map(result => {
        this.model = result;
        this.model.isDevelopment = this.model.environment === "development" ||
                                   this.model.environment === "staging" ||
                                   this.model.environment === "testing"   
      }));
  }

  init() {
    if (!this.model) {
      return this.getConfiguration();
    }
    else {
      return Observable.create(observer => { observer.next(this.model) });
    }
  }
}
