import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { ApiDataAccessService } from '../../app/services/api-data-access.service';
import { DatePipe } from '@angular/common'
import { AppConfigEntryComponent } from '../app-config-entry/app-config-entry.component';
import { ModalDialogsService } from '../../app/services/modal-dialogs.service'
import { process, State } from '@progress/kendo-data-query';
import { GridComponent, GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';

// jquery support
declare var $: any;

// init Common
declare function InitCommon(): any;

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

@Component({
  selector: 'app-apps-config',
  templateUrl: './apps-config.component.html',
  styleUrls: ['./apps-config.component.scss']
})
export class AppsConfigComponent implements OnInit {
  // app config entry reference instance
  @ViewChild(AppConfigEntryComponent) appConfigEntryComponent: AppConfigEntryComponent;

  // reference to apps config grid
  @ViewChild('appsConfigGrid') private grid;

  // app config entries filters
  public applicationCode: string = "None"; // defaults to none (will show only global)
  freeSearchText: string = "";
  configGroupFilter: string = "*";
  showGlobalConfigEntries: boolean = true;
  applicationConfigGroups: string[] = [];
  applicationConfigGroupsAsObjects: any[] = [];
  applicationsListAsObjects: any[] = [];
  //applicationConfigGroupsWithGlobal: string[] = [];

  // apps config grid
  appsConfigGrid: any;

  // app config entries
  applicationConfigEntries: any[] = [];
  applicationConfigEntries_Global: any[] = [];

  // grid state
  public state: State = {
    skip: 0,
    take: 1000,

    // Initial filter descriptor
    filter: {
      logic: 'or',
      filters: [
        { field: 'RecordId', operator: '>=', value: 0 }
        ,
        { field: 'RecordId', operator: '>=', value: 0 }
      ]
    }
  };

  // grid data
  public gridData: GridDataResult = process(this.applicationConfigEntries_Global.concat(this.applicationConfigEntries), this.state);

  // hold record id - for delete app config entry
  appConfigRecordId: string = "";

  // default constructor
  constructor(public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe, private modalDialogsService: ModalDialogsService) {
    // set current page
    this.globalsService.CurrentPage = "apps-config";
  }

  ngOnInit() {
    // init Common
    InitCommon();

    // load app config entries
    this.reloadApplicationConfigEntries();
  }

  // update app config entry
  updateAppConfigEntry(appConfigEntry: any) {
    // check if new app config entry
    if (appConfigEntry == null) {
      appConfigEntry = {
        RecordId: 0,
        ProcessCode: 0,
        PluginCode: 0,
        Status: 1,
        UserCode: 0,
        ServerCode: 0,
        ConfigKey: "",
        ConfigValue: "",
        ConfigDescription: "",
        ConfigGroup: ""
      };
    }

    this.appConfigEntryComponent.loadAppConfigEntry({ ...appConfigEntry });
  }

  // duplicate app config entry
  duplicateAppConfigEntry(appConfigEntry: any) {
    var copyOfAppConfigEntry = { ...appConfigEntry };
    copyOfAppConfigEntry.RecordId = 0;
    this.appConfigEntryComponent.loadAppConfigEntry(copyOfAppConfigEntry);
  }

  // reload application config entries 
  reloadApplicationConfigEntries() {
    // show loading... window
    OpenLoadingModal();

    // apps config for process/plugin
    this.apiDataAccessService.appsconfig_getAppsConfigList("").then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.applicationConfigEntries = data.ResponseData;

        // update distinct list of groups
        this.applicationConfigGroups = Array.from(new Set(this.applicationConfigEntries.map((item: any) => item.ConfigGroup))).filter(item => item != "");
        this.applicationConfigGroupsAsObjects = [{Code: '', Name: 'Empty Group'}].concat(this.applicationConfigGroups.map(val => ({ Code: val, Name: val })));
        this.applicationsListAsObjects = [{Code: 'None', Name: 'None'}].concat(this.globalsService.findGlobalSetting('FullApplicationsList',[]));

        // update grid data
        this.refreshGridData(this.state);
      }

      // delay - screen loaded
      setTimeout(() => {
        // hide loading... window
        CloseLoadingModal();

        // auto size grid columns
        this.grid.autoFitColumns()
      }, 500);

    });
  }

  // get full app config list
  getFullAppConfigList(){
    // create a copy of app config entries
    var applicationConfigEntriesCopy = [...this.applicationConfigEntries ];
    var globalConfigEntries = [...this.applicationConfigEntries ].filter(obj=> obj.ProcessCode == 0);

    // process entries
    applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> obj.ProcessCode > 0);

    // filter application code
    if (this.applicationCode.startsWith("Process-")){
      applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> obj.ProcessCode.toString() == this.applicationCode.split("-")[1]);
    }
    if (this.applicationCode.startsWith("Plugin-")){
      applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> obj.PluginCode.toString() == this.applicationCode.split("-")[1]);
    }
    if (this.applicationCode == "None"){
      applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> obj.ProcessCode == 0);
    }

    // add global app config entries
    if (this.showGlobalConfigEntries)
      applicationConfigEntriesCopy = globalConfigEntries.concat(applicationConfigEntriesCopy);

    // filter group entries
    if (this.configGroupFilter != "*"){
      applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> obj.ConfigGroup == this.configGroupFilter);
    }

    // filter free text search
    if (this.freeSearchText != ""){
      applicationConfigEntriesCopy = applicationConfigEntriesCopy.filter(obj=> 
        obj.ConfigKey.toString().toLowerCase().includes(this.freeSearchText.toString().toLowerCase()) || 
        obj.ConfigValue.toString().toLowerCase().includes(this.freeSearchText.toString().toLowerCase()));
    }

    return applicationConfigEntriesCopy;
  }

  // on group change event
  onGroupChange(group){
    this.configGroupFilter = group;
    this.refreshGridData(this.state);
  }

  // on free text change event
  onFreeTextChange(freeText){
    this.freeSearchText = freeText;
    this.refreshGridData(this.state);
  }

  // grid data state changed
  public refreshGridData(state: any): void {
    this.state = state;
    
    // update grid data
    this.gridData = process(this.getFullAppConfigList(), this.state);
  }

  // delete app config entry 
  deleteAppConfigEntry(recordId: string) {
    // delete entry - arrow function
    var deleteEntryAction = () => {
      // delete entry
      this.apiDataAccessService.appsconfig_deleteAppConfigEntry(recordId).then((data: any) => {
        // check if we got successful response
        if (data != null && data.ResponseData != null) {
          this.reloadApplicationConfigEntries();
        }
      });
    }

    // show confirm message
    this.modalDialogsService.showConfirm("Are you sure you want to delete this app config entry?", "Delete App Config", deleteEntryAction);
  }

  // fix application category for some cases on this component
  fixApplicationCategory(category: string) {
    if (category == "service")
      return "services";
    else
      return category;
  }
}
