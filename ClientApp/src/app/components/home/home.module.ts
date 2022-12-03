import { NgModule, isDevMode } from '@angular/core';
import { RouterModule } from '@angular/router';

//Third parties modules
//REF: http://stackoverflow.com/questions/41705618/angular2-jwt-authhttp-refresh-tokens-putting-it-all-together
import { ModalModule } from 'ngx-bootstrap/modal'
import { AlertModule } from 'ngx-bootstrap/alert'
import { CarouselModule } from 'ngx-bootstrap/carousel'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'

//Site Component
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { UserRegisterComponent } from '../user/user-register.component';
import { UserActivateComponent } from '../user/user.activate.component';
import { PasswordForgotComponent } from '../user/user.password.forgot.component';
import { PasswordRecoveryComponent } from '../user/user.password.recovery.component';

//Directives
import { SharedModule } from '../shared/shared.module';
import { homeRoutes } from './home.routes';
import { AppHomeComponent } from './app.home.component';
import { ContactComponent } from './contact/contact.component';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';


@NgModule({
  declarations: [
    AppHomeComponent,
    AboutComponent,
    UserRegisterComponent,
    PasswordRecoveryComponent,
    PasswordForgotComponent,
    UserActivateComponent,
    LoginComponent,
    HomeComponent,
    NavMenuComponent,
    ContactComponent,
  ],
  imports: [
    AlertModule.forRoot(),
    BsDropdownModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),//LoginComponent use it 
    SharedModule,
    RouterModule.forChild(homeRoutes),
    SocialLoginModule
  ],
  providers: [
     ],
  exports: [RouterModule]

})
export class HomeModule { }
