import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable({
  providedIn: 'root',
})
export class LangService {

  constructor(public http: HttpClient,
    public cnf: ConfigurationService) {
    console.log("Lang.Service.constructor");
    this.init().subscribe();
  }

  get getLangHash() {
    const hash = localStorage.getItem("langHash");
    return !hash ? null : hash;
  }

  get getLang(): ResourceValue[] {
    const lang = localStorage.getItem("lang");
    return !lang ? null : JSON.parse(lang);
  }

  init() {

    return this.http.get('/api/device/helper/hash/lang').pipe(
      map((hashResult: any) => {

        const hash = hashResult.hash;
        //Load configuración
        if (this.getLangHash !== hash || !this.getLang) {

          return this.http.get('/api/device/helper/lang')
            .pipe(
              map(result => {
                const resources = result as ResourceValue[];
                const serialized = JSON.stringify(resources);
                const preHash = serialized.toLowerCase().replace(/\\r\\n/g, "").replace(/("|')/g, "").replace(/ /g, "").replace(/\\/g, "");
                const langHash = Md5.hashStr(preHash).toUpperCase();
                localStorage.setItem("langHash", langHash);
                localStorage.setItem("lang", serialized);

              })).subscribe();
        }
      })
    );
  }

  Resource(name: string): string {

    if (!this.getLang) {
      return "";
    }
    else {
      const find = this.getLang.find(x => x.name === name);
      return !find ? "[Lang '" + name + "' not found]" : find.value;
    }

  }

}

interface ResourceValue {
  name: string;
  value: string;
}
