import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { ApiDataAccessService } from '../../app/services/api-data-access.service';
import { DatePipe } from '@angular/common'
import { State, SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { GridDataResult, DataStateChangeEvent, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { Observable, BehaviorSubject } from 'rxjs';
import { SessionsGridDataService } from '../services/grid-data-services.service';
import { ModalDialogsService } from '../../app/services/modal-dialogs.service'
import { Subscription }   from 'rxjs';

// init Common
declare function InitCommon(): any;

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

// jquery support
declare var $: any;

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  // reference to apps config grid
  @ViewChild('sessionsGrid') private grid;

  // filter settings
  timeRange: string = "Today";
  fromDate: Date = new Date();
  toDate: Date = new Date();
  onlineSessionsOnly: boolean = false;
  sessionsWithErrors: boolean = false;
  userCode: string = "0";
  serverCode: string = "0";
  applicationCode: string = "";
  minDate: Date = new Date(2010, 1, 1, 0, 0);

  // data is loaded - on first time
  dataLoaded: boolean = false;

  // sessions grid data & config
  public stateSessions: State = {
    skip: 0,
    take: 25,
    sort: [
      {
        field: "OpenTime",
        dir: "desc"
      }
    ]
  };
  public viewSessions: Observable<GridDataResult>;

  // sessionsLoaded subscription
  sessionsLoadedSubscription: Subscription;

  // default constructor
  constructor(public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe, private sessionsDataService: SessionsGridDataService, private modalDialogsService: ModalDialogsService) {
    // set current page
    this.globalsService.CurrentPage = "sessions";

    // set default filter settings
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate.setHours(23, 59, 0, 0);

    // load sessions
    this.viewSessions = sessionsDataService;

    // global filter updated event
    this.sessionsLoadedSubscription = this.sessionsDataService.dataFetchCompleted$.subscribe(
      data => {
        if (data == "Sessions") {
          // auto fit columns only for first time
          if(!this.dataLoaded) this.autoFitColumns();

          // hide loading... window
          CloseLoadingModal();

          this.dataLoaded = true;
        }
    });
  }

  ngOnInit() {
    // init Common
    InitCommon();

    // scroll to top of page
    window.scroll(0, 0);

    // load sessions list
    this.reloadSessionsList(true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.sessionsLoadedSubscription.unsubscribe();
  }

  // reload sessions
  reloadSessionsList(resetPage: boolean = false) {
    // reset page
    if (resetPage) this.stateSessions.skip = 0;

    // validate parameters
    if (this.fromDate == null || this.toDate == null) {
      this.modalDialogsService.showError("Invalid date values", "Dates Range Selection");
      return;
    }

    // validate dates range
    if (this.fromDate < this.minDate || this.toDate < this.minDate) {
      this.modalDialogsService.showError("Invalid date values", "Dates Range Selection");
      return;
    }

    // show loading... window
    OpenLoadingModal();

    // update plugin/process code
    var _processCode: string = "0";
    var _pluginCode: string = "0";
    if (this.applicationCode.startsWith("Process-")) {
      _processCode = this.applicationCode.replace("Process-", "");
    }
    if (this.applicationCode.startsWith("Plugin-")) {
      _pluginCode = this.applicationCode.replace("Plugin-", "");
    }

    this.sessionsDataService.query(this.stateSessions, {
      datesRangeType: this.timeRange,
      processCode: _processCode,
      pluginCode: _pluginCode,
      onlyOnlineUsers: this.onlineSessionsOnly ? "1" : "0",
      onlySessionsWithErrors: this.sessionsWithErrors ? "1" : "0",
      userCode: this.userCode,
      serverCode: this.serverCode,
      fromDate: this.datepipe.transform(this.fromDate, 'yyyy-MM-dd HH:mm'),
      toDate: this.datepipe.transform(this.toDate, 'yyyy-MM-dd HH:mm')
    });
  }

  // sessions grid - data state change event
  public dataStateChangeSessions(state: DataStateChangeEvent): void {
    this.stateSessions = state;
    this.reloadSessionsList(false);
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

  // get session type logo
  getSessionTypeLogo(dataItem: any){
    if (dataItem.SessionType == null) return "";

    switch (dataItem.SessionType.toString().toLowerCase()){
      case "windows":
        return "windows-logo.svg";
      default:
        return dataItem.SessionType.toString().toLowerCase() + "-logo.png";

    }
  }

  // style rows
  public rowCallback(context: RowClassArgs) {
    let rv: any = {};

    // check errors
    if (context.dataItem.ErrorsNumber > 0) {
      rv.error = true;
    }

    // check type
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

  // auto fit grid columns
  autoFitColumns() {
    // delay
    setTimeout(() => {
      this.grid.autoFitColumns();
    }, 250);

  }

  // convert to number
  toNumber(val: any){
    return Number(val);
  }

}
