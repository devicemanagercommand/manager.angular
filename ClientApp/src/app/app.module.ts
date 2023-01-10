import { environment } from './../environments/environment';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

//Third parties modules
//REF: http://stackoverflow.com/questions/41705618/angular2-jwt-authhttp-refresh-tokens-putting-it-all-together

import { CookieService } from 'ngx-cookie-service'

//Site Component
import { AppComponent } from './components/app/app.component'

//Directives
import { RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { SharedModule } from './components/shared/shared.module';

export function tokenGetter(): string {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    CarouselModule.forRoot(),
    AlertModule.forRoot(),
    HttpClientModule,
    SharedModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'devices',
        loadChildren: () => import('./components/device/devices.module').then(m => m.DeviceModule),
      },
      {
        path: 'home',
        loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule),
      }
    ], { relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule],
  providers: [
    CookieService,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lc9vLwZAAAAAPM54eTruhJf96D3u5KKlSa_OZ2G' },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              !environment.production   ? '682199222122-r2sc76p2ma6r2k764eijcra6b180jrsk.apps.googleusercontent.com' :
                                          '987106900255-js57hcs5j0857dqsdmuu84o49d2lh6s0.apps.googleusercontent.com'
              )
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig
    }

    ],
  bootstrap: [AppComponent],
})
export class AppModule { }
