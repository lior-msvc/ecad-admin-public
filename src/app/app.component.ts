import { Component, TemplateRef, ViewChild, OnInit, EventEmitter, Input, Output  } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { WindowService } from '@progress/kendo-angular-dialog';
import { GlobalsService } from "./services/globals.service"
import { Subscription }   from 'rxjs';
import { AppConfigService } from './services/app-config.service';
import { ApiDataAccessService } from './services/api-data-access.service';
import { ModalDialogsService } from './services/modal-dialogs.service';

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ecad-admin-client';

  // default constructor
  constructor(private apiDataAccessService: ApiDataAccessService, private dialogService: DialogService, private windowService: WindowService, public globalsService: GlobalsService, public modalDialogsService: ModalDialogsService ) {}

  ngOnInit(){
    // show loading modal
    OpenLoadingModal();
    
    // load global settings
    this.loadGlobalSettings();
  }

  // load global settings
  loadGlobalSettings() {
    this.apiDataAccessService.common_getGlobalSettings().then((data: any) => {
      // close loading modal
      CloseLoadingModal();

      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.globalsService.GlobalSettings = data.ResponseData;
      }
    });
  }
  public showConfirmation(template: TemplateRef<any>) {
    this.dialogService.open({
        title: 'Please confirm',
        content: template,
        actions: [
            { text: 'No' },
            { text: 'Yes', primary: true }
        ]
    });

    this.windowService.open({
      title: 'My List',
      content: template,
      width: 250,
      height: 230
  });
}
}
