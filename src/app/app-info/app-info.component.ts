import { Component, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { GlobalsService } from "../services/globals.service"
import { Subscription } from 'rxjs';
import { ApiDataAccessService } from '../../app/services/api-data-access.service';
import { DatePipe, DOCUMENT } from '@angular/common'
import { State, SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { GridDataResult, DataStateChangeEvent, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { SessionsGridDataService, LogsGridDataService } from '../services/grid-data-services.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AppConfigEntryComponent } from '../app-config-entry/app-config-entry.component';
import { ModalDialogsService } from '../../app/services/modal-dialogs.service'
//import { $ } from 'protractor';

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

// init Common
declare function InitCommon(): any;

// jquery support
declare var $: any;

// dates manipulation
import * as moment from 'moment';

@Component({
  selector: 'app-app-info',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-info.component.html',
  styleUrls: ['./app-info.component.scss']
})

export class AppInfoComponent implements OnInit {
  // app config entry reference instance
  @ViewChild(AppConfigEntryComponent) appConfigEntryComponent: AppConfigEntryComponent;

  // current application key 
  applicationKey: any;
  isProcess: boolean;
  pluginCode: number = 0;
  processCode: number = 0;
  applicationStatistics: any;
  applicationStatisticsCopy: any;

  // app config entries
  applicationConfigEntries: any[] = [];
  applicationConfigEntries_Global: any[] = [];

  // hold record id - for delete app config entry
  appConfigRecordId: string = "";

  // app config entries filters
  configGroupFilter: string = "*";
  showGlobalConfigEntries: boolean = false;
  applicationConfigGroups: string[] = [];
  applicationConfigGroupsWithGlobal: string[] = [];

  // sessions grid data & config
  public stateSessions: State = {
    skip: 0,
    take: 20,
    sort: [
      {
        field: "OpenTime",
        dir: "desc"
      }
    ]
  };
  public viewSessions: Observable<GridDataResult>;

  // sessions filter parameters
  sessionsDatesRangeType: string = "This Month";
  sessionsOnlineApplicationsOnly: boolean = false;
  sessionsUserCode: number = 0;

  // sessions per day statistics
  sessionsPerDayDate: Date = new Date();
  sessionsPerDaySummary: any[] = [];
  sessionsPerDaySummary_Categories: string[] = [];
  sessionsPerDaySummary_Values: number[] = [];

  // default constructor
  constructor(private route: ActivatedRoute, private router: Router, public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe, private sessionsDataService: SessionsGridDataService, private el: ElementRef, @Inject(DOCUMENT) document, private modalDialogsService: ModalDialogsService) {
    // set default values
    this.applicationStatistics = {};
    this.applicationStatisticsCopy = {};

    // load sessions
    this.viewSessions = sessionsDataService;

    // set default date (current month)
    let dt = new Date();
    this.sessionsPerDayDate = new Date(dt.getFullYear(), dt.getMonth(), 1);
  }

  ngOnInit() {
    // init Common
    InitCommon();

    // set current page
    this.globalsService.CurrentPage = "app-info";

    // scroll to top of page
    window.scroll(0, 0);

    // get app key
    this.applicationKey = this.route.snapshot.paramMap.get('appKey');

    // check if plugin/process
    if (this.applicationKey.startsWith("Process-")) {
      this.isProcess = true;
      this.processCode = Number(this.applicationKey.replace("Process-", ""));
    }
    if (this.applicationKey.startsWith("Plugin-")) {
      this.isProcess = false;
      this.pluginCode = Number(this.applicationKey.replace("Plugin-", ""));
    }

    // load application statistics
    this.reloadApplicationStatistics();

    // load app config entries
    this.reloadApplicationConfigEntries();

    // load sessions list
    this.reloadSessionsList();

    // reload sessions per day
    this.reloadSessionsPerDay();
  }

  // reload sessions
  reloadSessionsList() {
    this.sessionsDataService.query(this.stateSessions, {
      datesRangeType: this.sessionsDatesRangeType,
      processCode: this.processCode,
      pluginCode: this.pluginCode,
      onlyOnlineUsers: this.sessionsOnlineApplicationsOnly ? "1" : "0",
      userCode: this.sessionsUserCode
    });
  }

  // update user favorite application
  updateUserFavoriteApplication()
  {
    this.applicationStatistics.IsFavoriteForUser =! this.applicationStatistics.IsFavoriteForUser;

    this.apiDataAccessService.users_setUserFavoriteApplication(this.globalsService.findGlobalSetting("CurrentUserName",""), this.applicationStatistics.Key,this.applicationStatistics.IsFavoriteForUser);
  }

  // reload sessions per day
  reloadSessionsPerDay(monthsToAdd: number = 0) {
    // reset data
    this.sessionsPerDaySummary = [];
    this.sessionsPerDaySummary_Categories = [];
    this.sessionsPerDaySummary_Values = [];

    // check if we need to add months
    if (monthsToAdd != 0){
      var dt = moment([this.sessionsPerDayDate.getFullYear(), this.sessionsPerDayDate.getMonth(), this.sessionsPerDayDate.getDate()]);
      dt = dt.add(monthsToAdd, 'months');
      this.sessionsPerDayDate = dt.toDate();
    }

    var fromDate = moment([this.sessionsPerDayDate.getFullYear(), this.sessionsPerDayDate.getMonth(), this.sessionsPerDayDate.getDate()]);
    var toDate = moment([this.sessionsPerDayDate.getFullYear(), this.sessionsPerDayDate.getMonth(), this.sessionsPerDayDate.getDate()]).add(1,'months');

    this.apiDataAccessService.sessions_getSessionsPerDay(fromDate.format("yyyy-MM-DD"), toDate.format("yyyy-MM-DD"), "0", this.processCode.toString(), this.pluginCode.toString()).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        
        if (data.ResponseData.length > 0){
          this.sessionsPerDaySummary = data.ResponseData;
          this.sessionsPerDaySummary_Categories = this.sessionsPerDaySummary.map((obj: any) => {
            return obj.Day;
          });
          this.sessionsPerDaySummary_Values = this.sessionsPerDaySummary.map((obj: any) => {
            return obj.Sessions;
          });
        }
          
      }
    });
  }

  // get session type logo
  getSessionTypeLogo(sessionType: string){
    if (sessionType == null) return "";

    switch (sessionType.toString().toLowerCase()){
      case "windows":
      case "plugin":
        return "windows-logo.svg";
      default:
        return sessionType.toString().toLowerCase() + "-logo.png";

    }
  }

  // sessions grid - data state change event
  public dataStateChangeSessions(state: DataStateChangeEvent): void {
    this.stateSessions = state;
    this.reloadSessionsList();
  }

  ngOnDestroy() {
  }

  // reload applications statistics 
  reloadApplicationStatistics() {
    // show loading... window
    OpenLoadingModal();

    this.apiDataAccessService.applications_getApplicationsStatistics("All", this.applicationKey, false, false, "All").then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        // check if found application statistics
        if (data.ResponseData.length > 0)
          this.applicationStatistics = data.ResponseData[0];

      }

      // hide loading... window
      CloseLoadingModal();
    });
  }

  // open edit metadata popup window
  openEditMetadataPopupWindow() {
    // create object copy
    this.applicationStatisticsCopy = { ...this.applicationStatistics };

    // update jquery events after loading data
    InitCommon();

    // open edit metadata popup window
    $("#edit-metadata-modal").modal('show');
  }

  // update app config entry
  updateAppConfigEntry(appConfigEntry: any) {
    // check if new app config entry
    if (appConfigEntry == null) {
      appConfigEntry = {
        RecordId: 0,
        ProcessCode: this.isProcess ? this.applicationStatistics.Code : 0,
        PluginCode: this.isProcess ? 0 : this.applicationStatistics.Code,
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

  // update application details
  updateApplicationDetails() {
    // show loading... window
    OpenLoadingModal();

    if (this.isProcess) {
      // update process details
      this.apiDataAccessService.applications_updateApplicationDetails(this.processCode, this.applicationStatisticsCopy.ApplicationName, this.applicationStatisticsCopy.ApplicationCategory, this.applicationStatisticsCopy.ApplicationDescription, this.applicationStatisticsCopy.ApplicationUrl, this.applicationStatisticsCopy.ApplicationIcon).then((data: any) => {
        // check if we got successful response
        if (data != null && data.ResponseData != null) {
          // refresh screen data
          this.reloadApplicationStatistics();
        }
      });
    }
    else {
      // update plugin details

      // hide loading... window
      CloseLoadingModal();
    }
  }

  // reload application config entries 
  reloadApplicationConfigEntries() {
    // apps config for process/plugin
    this.apiDataAccessService.appsconfig_getAppsConfigList(this.applicationKey).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.applicationConfigEntries = data.ResponseData;

        // update distinct list of groups
        this.applicationConfigGroups = Array.from(new Set(this.applicationConfigEntries.map((item: any) => item.ConfigGroup))).filter(item => item != "");
      }
    });

    // apps config for global
    this.apiDataAccessService.appsconfig_getAppsConfigList("Process-0").then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.applicationConfigEntries_Global = data.ResponseData;

        // update distinct list of groups - includs global configs
        this.applicationConfigGroupsWithGlobal = Array.from(new Set(this.applicationConfigEntries_Global.concat(this.applicationConfigEntries).map((item: any) => item.ConfigGroup))).filter(item => item != "");
      }
    });
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

  // return total sessions
  getTotalSessions() {
    let sessionsDataSource: any = this.viewSessions;
    if (sessionsDataSource == null) return "...";
    if (sessionsDataSource.value == null) return "...";
    return sessionsDataSource.value.total
  }

  // check if session is online
  isSessionOnline(dataItem: any) {
    let currentTime: Date = new Date();
    if (dataItem.CloseTime == null && dataItem.LastPingTime != null && this.getDiffInMinutes(dataItem) < 10) return true;
    return false;
  }

  // get current time
  public getDiffInMinutes(dataItem: any) {
    let currentTime: Date = new Date();
    return Math.floor(((currentTime.getTime() - dataItem.LastPingTime)) / 60000);
  }

  // style rows
  public rowCallback(context: RowClassArgs) {
    let rv: any = {};

    // check errors
    if (context.dataItem.ErrorsNumber > 0) {
      rv.error = true;
    }

    // check type
    if (context.dataItem.PluginCode > 0)
      rv.Plugin = true;
    else
      rv[context.dataItem.ApplicationCategory] = true;

    // check online
    let currentTime: Date = new Date();
    if (context.dataItem.CloseTime == null && context.dataItem.LastPingTime != null && Math.floor(((currentTime.getTime() - context.dataItem.LastPingTime)) / 60000) < 10) {
      //rv.odd = true;
      //rv.even = false;
      rv.online = true;
    }
    else {
      //rv.odd = false;
      //rv.even = true;
    }

    return rv;
  }
}
