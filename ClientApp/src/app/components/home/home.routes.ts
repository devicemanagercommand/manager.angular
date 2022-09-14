import { Routes } from "@angular/router";
import { Redirect2DeviceGuard } from "../shared/redirect2device.canActivate";
import { UserRegisterComponent } from "../user/user-register.component";
import { UserActivateComponent } from "../user/user.activate.component";
import { PasswordForgotComponent } from "../user/user.password.forgot.component";
import { PasswordRecoveryComponent } from "../user/user.password.recovery.component";
import { AppHomeComponent } from "./app.home.component";
import { ContactComponent } from "./contact/contact.component";
import { HomeComponent } from "./home.component";
import { LoginComponent } from "./login/login.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";

export const homeRoutes: Routes = [
  {
    path: '', component: AppHomeComponent, canActivate: [Redirect2DeviceGuard],
    children: [
      { path: '', component: HomeComponent, canActivate: [Redirect2DeviceGuard] },
      { path: 'sign-up', component: UserRegisterComponent },
      { path: 'login', component: LoginComponent, canActivate: [Redirect2DeviceGuard] },
      { path: 'privacy', component: PrivacyPolicyComponent },
      { path: 'login/main', component: LoginComponent, canActivate: [Redirect2DeviceGuard] },
      { path: 'activate/:result', component: UserActivateComponent },
      { path: 'password/forgot', component: PasswordForgotComponent },
      { path: 'password/recovery/:userId/:isFromMail/:tocken', component: PasswordRecoveryComponent },
      { path: 'contact', component: ContactComponent },
    ]
  },
]
