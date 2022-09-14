import { NgModule, isDevMode } from '@angular/core';

//Site Component
import { DeviceLeftNavMenuComponent } from './../navmenu/device-header-nav-menu.component';
import { DeviceNavMenuComponent } from './../navmenu/deviceNavMenu.component';
import { DeviceProcessNavMenuComponent } from './../navmenu/deviceProcessNavMenu.component';
import { DownloadComponent } from '../device/download/download.component';
import { DeviceComponent } from './../device/list/device.component';
import { DeviceInfoComponent } from './info/device.info.component';
import { CommandsComponent } from './commands/commands.component';
import { AddCommandDialogComponent } from './commands/add-command-dialog.component';
import { StepControlComponent } from './commands/step-control.component';
import { StepCommandComponent } from './commands/step-command.component';
import { StepMethodComponent } from './commands/step-method.component';
import { StepSummaryComponent } from './commands/step-summary.component';
import { SettingsComponent } from './setttings/settings.component';
import { DeleteDeviceDialogComponent } from './setttings/delete-device-dialog.component';
import { ProcessComponent } from './process/process.component';
import { ProcessOptionsComponent } from './process/process.options.component';

//Shared Component
import { PluginsComponent } from './../administrator/plugins/plugins.component';

//Directives
import { AppDeviceComponent } from './app.component';
import { devicesRoutes } from './devices.routes';
import { SharedModule } from '../shared/shared.module';
import { CommandResponseDetailDialogComponent } from './commands/commands-response-detail-dialog.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LogoutModalComponent } from '../shared/logout.modal.component';
import { ClipboardModule } from '@angular/cdk/clipboard';


export function tokenGetter(): string {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppDeviceComponent,
    DownloadComponent,
    PluginsComponent,
    DeviceLeftNavMenuComponent,
    DeviceNavMenuComponent,
    DeviceProcessNavMenuComponent,
    DeviceComponent,
    DeviceInfoComponent,
    CommandsComponent,
    AddCommandDialogComponent,
    StepControlComponent,
    StepCommandComponent,
    StepMethodComponent,
    StepSummaryComponent,
    SettingsComponent,
    DeleteDeviceDialogComponent,
    ProcessComponent,
    ProcessOptionsComponent,
    CommandResponseDetailDialogComponent,
    LogoutModalComponent,
  ],
  imports: [
    BsDropdownModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    SharedModule,
    ClipboardModule,
    devicesRoutes
  ]
})
export class DeviceModule { }
