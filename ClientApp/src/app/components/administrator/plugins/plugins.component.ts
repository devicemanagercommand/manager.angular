import { Component } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType } from '@angular/common/http';
import { AlertPanel, AlertType } from '../../shared/alert.panel.component';
import { LangService } from '../../../services/shared/lang.service';
import { PluginService } from '../../../services/administrator/plugin.service';
import { PluginUploadModel } from '../../../models/administrator/plugins/plugin.upload.model';
import { finalize } from 'rxjs/operators';
import { MessageService } from '../../../services/shared/message.service';
import { SnackbarService } from '../../../services/shared/snackbar.service';

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.scss']
})
/** plugins component*/
export class PluginsComponent {
  progress: number;
  message: string;
  alertPanel: AlertPanel;
  isLoading = false;
  /** plugins ctor */
  constructor(private http: HttpClient,
    public rs: LangService,
    public pluginService: PluginService,
    public messageService: MessageService,
    public snackbarService: SnackbarService
  ) {

  }

  upload(files) {
    if (files.length === 0)
      return;

    //const formData = new FormData();

    //for (let file of files)
    //formData.append(file.name, file);

    let file = files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let pluginUploadModel = new PluginUploadModel();
      pluginUploadModel.Base64File = reader.result.toString().split(',')[1];
      pluginUploadModel.FileName = file.name

      this.isLoading = true;
      this.pluginService.upload(pluginUploadModel)
        .pipe(finalize(() => {
          this.isLoading = false;
        }))
        .subscribe(
          (rsp) => {
            this.snackbarService.Success("Ok");
          }
          ,
          (err) => {
            console.log(err);
            this.snackbarService.Error(err);
          }
        );
    }

    /*
    const uploadReq = new HttpRequest('POST', `api/plugin/plugin/upload`, formData, {
      reportProgress: true,
    });

    this.http.request(uploadReq).subscribe(event => {

      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round(100 * event.loaded / event.total);
      }
      else if (event.type === HttpEventType.Response) {
        this.message = event.body.toString();
        this.alertPanel = new AlertPanel(this.message, AlertType.Success);
      }

    });
    */
  }
}
