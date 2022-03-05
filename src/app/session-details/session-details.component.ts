import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ApiDataAccessService } from '../services/api-data-access.service';
import { GlobalsService } from "../services/globals.service"
import { switchMap } from 'rxjs/operators';
import { DatePipe, DOCUMENT } from '@angular/common'
import { SessionLogsGridDataService } from '../services/grid-data-services.service';
import { State, SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject } from 'rxjs';
import { GridDataResult, DataStateChangeEvent, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { Subscription } from 'rxjs';

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

// init Common
declare function InitCommon(): any;

// jquery support
declare var $: any;

@Component({
  selector: 'app-session-details',
  templateUrl: './session-details.component.html',
  styleUrls: ['./session-details.component.scss']
})
export class SessionDetailsComponent implements OnInit {
  // sessionsLoaded subscription
  logsLoadedSubscription: Subscription;

  // reference to logs grid
  @ViewChild('logsGrid') private logsGrid;

  // session details
  sessionId: string = "";
  sessionDetails: any = {};

  // apps config usage
  sessionAppsConfigUsage: any[] = [];

  // logs filters
  logLevel: number = 0;
  source: string = "";
  freeSearchText: string = "";

  // show/hide log entry details
  showLogEntryDetails: boolean = false;
  loadingEntryDetails: boolean = false;
  currentRowIndex: number = 0;
  currentLogEntry: any = {};

  // logs grid data & config
  public stateLogs: State = {
    skip: 0,
    take: 100,
    sort: [
      {
        field: "RecordId",
        dir: "asc"
      }
    ]
  };
  public viewLogs: Observable<GridDataResult>;

  // data is loaded - on first time
  dataLoaded: boolean = false;

  // default constructor
  constructor(private sessionLogsGridDataService: SessionLogsGridDataService, public globalsService: GlobalsService, private route: ActivatedRoute, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe) {
    // set current page
    this.globalsService.CurrentPage = "session-details";

    // load logs
    this.viewLogs = sessionLogsGridDataService;

    // data loaded event
    this.logsLoadedSubscription = this.sessionLogsGridDataService.dataFetchCompleted$.subscribe(
      data => {
        if (data == "SessionLogs") {
          // auto fit columns only for first time
          //if(!this.dataLoaded) this.autoFitColumns();

          this.dataLoaded = true;
        }
      });
  }

  ngOnInit() {
    // get session id
    this.sessionId = this.route.snapshot.paramMap.get('id');

    // init Common
    InitCommon();

    // scroll to top of page
    window.scroll(0, 0);

    // load session details
    this.loadSessionDetails();

    // load logs list
    this.reloadLogsList(true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.logsLoadedSubscription.unsubscribe();
  }

  // return total logs
  getTotalLogs() {
    let logsDataSource: any = this.viewLogs;
    if (logsDataSource == null) return "...";
    if (logsDataSource.value == null) return "...";
    return logsDataSource.value.total
  }

  // reload logs
  reloadLogsList(resetPage: boolean = false) {
    // reset page
    if (resetPage) this.stateLogs.skip = 0;

    // load data
    this.sessionLogsGridDataService.query(this.stateLogs, {
      sessionId: this.sessionId,
      source: this.source,
      searchText: this.freeSearchText,
      logLevel: this.logLevel
    });
  }

  // logs grid - data state change event
  public dataStateChangeLogs(state: DataStateChangeEvent): void {
    this.stateLogs = state;
    this.reloadLogsList(false);
  }

  // style rows
  public rowCallback(context: RowClassArgs) {
    let rv: any = {};

    /*
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
    */

    // set log level name
    rv[context.dataItem.LogLevelName] = true;

    return rv;
  }

  // load session details 
  loadSessionDetails() {
    // show loading... window
    OpenLoadingModal();

    // load session details
    this.apiDataAccessService.sessions_getSessionDetails(this.sessionId).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.sessionDetails = data.ResponseData;

        // fix dates
        if (this.sessionDetails.OpenTime != null) this.sessionDetails.OpenTime = new Date(this.sessionDetails.OpenTime);
        if (this.sessionDetails.LastPingTime != null) this.sessionDetails.LastPingTime = new Date(this.sessionDetails.LastPingTime);
        if (this.sessionDetails.CloseTime != null) this.sessionDetails.CloseTime = new Date(this.sessionDetails.CloseTime);

        // calculate session time
        if (this.sessionDetails.OpenTime != null) this.sessionDetails.SessionTime = this.calculateSessionTime(new Date(this.sessionDetails.OpenTime), this.sessionDetails.CloseTime);
      }

      // hide loading... window
      CloseLoadingModal();
    });

    // load apps config usage
    this.apiDataAccessService.appsconfig_getAppsConfigUsageList(this.sessionId).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.sessionAppsConfigUsage = data.ResponseData;
      }
    });
  }

  // calculate session time
  private calculateSessionTime(openTime: Date, closeTime: Date) {
    if (closeTime == null)
      closeTime = new Date();
    else
      closeTime = new Date(closeTime);

    return (new Date(closeTime.getTime() - openTime.getTime())).toISOString().substr(11, 8);
  }

  // get session type logo
  getSessionTypeLogo() {
    if (this.sessionDetails.SessionType == null) return "";

    switch (this.sessionDetails.SessionType.toString().toLowerCase()) {
      case "windows":
        return "windows-logo.svg";
      default:
        return this.sessionDetails.SessionType.toString().toLowerCase() + "-logo.png";

    }
  }

  // fix session type
  fixSessionType() {
    if (this.sessionDetails.ApplicationCategory == null) return "";

    if (this.sessionDetails.PluginCode > 0)
      return "Plugin"
    else
      return this.sessionDetails.ApplicationCategory;
  }

  // check if session is online
  isSessionOnline() {
    // check if session loaded
    if (this.sessionDetails.LastPingTime == null) return false;

    let currentTime: Date = new Date();
    let lastPingTime: Date = this.sessionDetails.LastPingTime;

    if (this.sessionDetails.CloseTime == null && lastPingTime != null && this.getDiffInMinutes(currentTime.getTime(), lastPingTime) < 10) {
      return true;
    }
    else {
      return false;
    }
  }

  // get current time
  public getDiffInMinutes(endTime: any, startTime: any) {
    let currentTime: Date = new Date();
    return Math.floor(((endTime - startTime)) / 60000);
  }

  // show log entry details 
  viewLogEntryDetails(dataItem: any) {
    // reset current log entry
    this.currentLogEntry = {};

    // scroll to top of page
    window.scroll(0, 0);

    // check log entry type
    if (dataItem.LogLevel == 1 || dataItem.LogLevel == 2 || dataItem.LogLevel == 3 || dataItem.LogLevel == 4) {
      // simple log entry
      this.currentLogEntry = dataItem;

      // load log entry details
      this.currentRowIndex = dataItem._rowindex;
      this.showLogEntryDetails = true;
    }
    else {
      // load relevant log entry type

      // show processing...
      this.globalsService.showProcessingWindow("loading log entry details");
      this.loadingEntryDetails = true;

      // load log entry
      this.apiDataAccessService.logs_getLogEntryDetails(dataItem).then((data: any) => {
        // check if we got successful response
        if (data != null && data.ResponseData != null) {
          this.currentLogEntry = data.ResponseData;

          // load log entry details
          this.currentRowIndex = dataItem._rowindex;
          this.showLogEntryDetails = true;
        }

        // hide processing...
        this.globalsService.hideProcessingWindow();
        this.loadingEntryDetails = false;
      });
    }
  }

  // move to next log entry
  moveToNextLogEntry(step: number) {
    if (step == -1 && this.currentRowIndex == 0) return;
    if (step == 1 && (this.currentRowIndex + 1) >= this.viewLogs["value"]["data"].length) return;

    // move to next row
    this.currentRowIndex += step;
    this.viewLogEntryDetails(this.viewLogs["value"]["data"][this.currentRowIndex]);
  }

  // hide log entry details 
  hideLogEntryDetails() {
    this.showLogEntryDetails = false;
  }

  // auto fit grid columns
  autoFitColumns() {
    // delay
    setTimeout(() => {
      console.log("auto fit grid columns");
      this.logsGrid.autoFitColumns();
    }, 250);
  }

}
