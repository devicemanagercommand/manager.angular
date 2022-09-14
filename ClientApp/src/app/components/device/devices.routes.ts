import { RouterModule } from "@angular/router";
import { PluginsComponent } from "../administrator/plugins/plugins.component";
import { DownloadComponent } from "./download/download.component";
import { RedirectToLoginGuard } from "../shared/redirect2login.canActivate";
import { AppDeviceComponent } from "./app.component";
import { AddCommandDialogComponent } from "./commands/add-command-dialog.component";
import { CommandsComponent } from "./commands/commands.component";
import { DeviceComponent } from "./list/device.component";
import { DeviceInfoComponent } from "./info/device.info.component";
import { ProcessComponent } from "./process/process.component";
import { SettingsComponent } from "./setttings/settings.component";

export const devicesRoutes = RouterModule.forChild([
  {
    path: '', component: AppDeviceComponent, canActivate: [RedirectToLoginGuard],
    children: [
      { path: '', component: DeviceComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'info/:id/:userContractId', component: DeviceInfoComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'commands/:id/:userContractId', component: CommandsComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'commands/add/:id/:userContractId', component: AddCommandDialogComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'setting/:id/:userContractId', component: SettingsComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'process/:id/:userContractId', component: ProcessComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'download', component: DownloadComponent, canActivate: [RedirectToLoginGuard] },
      { path: 'administrator/plugins', component: PluginsComponent, canActivate: [RedirectToLoginGuard], data: { roles: ["plugin"] } },
    ]
  }]
)
