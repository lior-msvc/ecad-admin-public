import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalsService } from '../services/globals.service'
import { ApiDataAccessService } from '../../app/services/api-data-access.service';

// jquery support
declare var $: any;

// init Common
declare function InitCommon(): any;

@Component({
  selector: 'app-app-config-entry',
  templateUrl: './app-config-entry.component.html',
  styleUrls: ['./app-config-entry.component.scss']
})
export class AppConfigEntryComponent implements OnInit {
  // event - app config apdated
  @Output() onSave: EventEmitter<any> = new EventEmitter();

  // fields validations
  isValid_KeyField: boolean = true;
  isValid_ValueField: boolean = true;

  // app config entry
  appConfigEntry: any = {};

  // default constructor
  constructor(public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService) { }

  ngOnInit() {
  }

  // load app config entry
  loadAppConfigEntry(entry: any) {
    // reset fields validations
    this.isValid_KeyField = true;
    this.isValid_ValueField = true;

    // set app config entry
    this.appConfigEntry = entry;
    this.appConfigEntry.Status = this.appConfigEntry.Status.toString(); // for ng model support (must be string)
    this.appConfigEntry.IsGlobal = (this.appConfigEntry.ProcessCode == 0 && this.appConfigEntry.PluginCode == 0) ? "1" : "0" // for ng model support (global/specific)

    // open edit app config popup window
    $("#config-entry-modal").modal('show');

    // fix modal input fields
    InitCommon();
  }

  // change global or specific
  changeGlobalOrSpecific() {
    // reset selected application
    if (this.appConfigEntry.IsGlobal == "1") {
      this.appConfigEntry.ProcessCode = 0;
      this.appConfigEntry.PluginCode = 0;
    }
  }

  // update app config entry
  updateAppConfigEntry() {
    // validate fields
    if (this.appConfigEntry.ConfigKey == "" || this.appConfigEntry.ConfigValue == ""){
      if (this.appConfigEntry.ConfigKey == "") this.isValid_KeyField = false;
      if (this.appConfigEntry.ConfigValue == "") this.isValid_ValueField = false;
      return;
    }

    // show processing window
    this.globalsService.showProcessingWindow("creating/updating app config");

    // update entry
    this.apiDataAccessService.appsconfig_updateAppConfigEntry(this.appConfigEntry).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        // close edit app config popup window
        $("#config-entry-modal").modal('hide');

        // raise event - save
        this.onSave.emit(null);

        // hide processing window
        this.globalsService.hideProcessingWindow();
      }
    });
  }
  
}
