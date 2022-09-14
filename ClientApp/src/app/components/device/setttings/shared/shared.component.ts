import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ResourceModel } from '../../../../models/device/settings/resource.model';
import { SettingsModel } from '../../../../models/device/settings.model';
import { finalize } from 'rxjs/operators';
import { ResourceService } from '../../../../services/device/resource.service';
import { AlertPanel } from '../../../shared/alert.panel.component';
import { LangService } from '../../../../services/shared/lang.service';
import { UserService } from '../../../../services/user/user.service';
import { MessageService } from '../../../../services/shared/message.service';
import { MatTableDataSource } from '@angular/material/table';
import { SharedUserModel } from '../../../../models/identity/shared-user-model';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogType, DialogService } from '../../../shared/dialog.component';

@Component({
  selector: 'dmc-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})

export class SharedComponent implements OnInit, OnDestroy {

  @Input() model: SettingsModel;
  isLoading: boolean;

  public sharedAlert: AlertPanel;
  urlParamSubscription: Subscription;
  displayedColumns: string[] = ['user', 'action']

  constructor(
    public resourceService: ResourceService,
    public rs: LangService,
    public userService: UserService,
    public messageService: MessageService,
    public activatedRoute: ActivatedRoute,
    public ds: DialogService,
  ) {
  }
  ngOnDestroy(): void {
    this.urlParamSubscription.unsubscribe();
  }

  ngOnInit(): void {
    const rm = new ResourceModel(
      `${this.model.device.id}_${this.model.device.userContractId}`,
      this.userService.getSavedInfo().id,
      "dummymail",
      1,//Device category
      this.model.device.description
    );

    this.urlParamSubscription = this.activatedRoute.params.subscribe(params => {
      this.resourceService.getSharedUsers(rm)
        .subscribe((rsp: SharedUserModel[]) => {
          this.model.sharedUsers = rsp;
          this.model.sharedUsersDataSource = new MatTableDataSource(rsp)
        }, (e) => {
          this.sharedAlert = this.messageService.Error(e);
        });
    });

  }

  share() {

    const rm = new ResourceModel(
      `${this.model.device.id}_${this.model.device.userContractId}`,
      this.userService.getSavedInfo().id,
      this.model.mail,
      1,//Device category
      this.model.device.description
    );

    this.isLoading = true;
    this.resourceService.save(rm)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        (user: SharedUserModel) => {
          console.debug("ShareComponente.share() success");
          this.sharedAlert = this.messageService.Success(this.rs.Resource('LabelSuccess'));

          if (user) {


            if (!this.model.sharedUsers) {
              this.model.sharedUsers = new Array<SharedUserModel>();
            }

            if (this.model.sharedUsers.length >= 0
              && !this.model.sharedUsers.find(o => o.user === user.user)) {
              this.model.sharedUsers.push(user);
              this.model.sharedUsersDataSource = new MatTableDataSource(this.model.sharedUsers)
            }

          }
          //Disble button for 3 seconds, to prevent flood with session
          this.model.enableShare = false;
          const interval = setInterval(() => { this.model.enableShare = true; clearInterval(interval); }, 3000);
        }
        , (e) => {
          this.sharedAlert = this.messageService.Error(e);
        }
      );
  }

  action(action, obj: SharedUserModel) {

    if (action === 'Delete') {
      this.delete(obj);
    }

  }

  delete(sharedUserModel: SharedUserModel) {
    this.ds.confirm(this.rs.Resource("ConfirmRemove"), this.rs.Resource("LabelRemove"))
      .subscribe((rsp: boolean) => {

        if (rsp) {

          sharedUserModel.resource =
            new ResourceModel(
              `${this.model.device.id}_${this.model.device.userContractId}`,
              this.userService.getSavedInfo().id,
              "dummiemail",
              1,//Device category
              this.model.device.description
            );

          this.isLoading = true;
          this.resourceService.removeSharedUser(sharedUserModel)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(
              () => {
                this.model.sharedUsers = this.model.sharedUsers.filter(o => o.userId !== sharedUserModel.userId);
                this.model.sharedUsersDataSource = new MatTableDataSource(this.model.sharedUsers);
              }
              , (e) => {
                this.sharedAlert = this.messageService.Error(e);
              }
            );
        }
      });
  }
}
