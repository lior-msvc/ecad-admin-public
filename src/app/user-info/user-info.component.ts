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
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  // user details
  userCode: string = "0";
  userStatistics: any;
  userApplications: any[] = [];  

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
  applicationCode: string = "";

  // sessions per day statistics
  sessionsPerDayDate: Date = new Date();
  sessionsPerDaySummary: any[] = [];
  sessionsPerDaySummary_Categories: string[] = [];
  sessionsPerDaySummary_Values: number[] = [];

  // default constructor
  constructor(private route: ActivatedRoute, private router: Router, public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe, private sessionsDataService: SessionsGridDataService, private el: ElementRef, @Inject(DOCUMENT) document, private modalDialogsService: ModalDialogsService) {
    // set default values
    this.userStatistics = {};

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
    this.globalsService.CurrentPage = "user-info";

    // scroll to top of page
    window.scroll(0, 0);

    // get user code
    this.userCode = this.route.snapshot.paramMap.get('userCode');

    // reload user statistics 
    this.reloadUserStatistics();

    // load sessions list
    this.reloadSessionsList();

    // reload user applications
    this.reloadUserApplications();

    // reload sessions per day
    this.reloadSessionsPerDay();
  }

  // get user display name
  getUserDisplayName(){
    let rv: string = this.userStatistics.UserDomain + '\\' + this.userStatistics.UserName;

    if (this.userStatistics.Properties != null && this.userStatistics.Properties.English_FullName != ""){
      rv = this.userStatistics.Properties.English_FullName;
    }
    
    return rv;
  }

  // reload sessions
  reloadSessionsList(resetPage: boolean = false) {
    // reset page
    if (resetPage) this.stateSessions.skip = 0;

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
      datesRangeType: this.sessionsDatesRangeType,
      processCode: _processCode,
      pluginCode: _pluginCode,
      onlyOnlineUsers: this.sessionsOnlineApplicationsOnly ? "1" : "0",
      userCode: this.userCode
    });
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

    this.apiDataAccessService.sessions_getSessionsPerDay(fromDate.format("yyyy-MM-DD"), toDate.format("yyyy-MM-DD"), this.userCode, "0", "0").then((data: any) => {
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

  // sessions grid - data state change event
  public dataStateChangeSessions(state: DataStateChangeEvent): void {
    this.stateSessions = state;
    this.reloadSessionsList();
  }

  // reload user statistics 
  reloadUserStatistics() {
    // show loading... window
    OpenLoadingModal();

    this.apiDataAccessService.users_getUsersStatistics("All", this.userCode).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        // check if found application statistics
        if (data.ResponseData.length > 0)
          this.userStatistics = data.ResponseData[0];
      }

      // hide loading... window
      CloseLoadingModal();
    });
  }

  // reload user applications
  reloadUserApplications() {
    this.apiDataAccessService.users_getUserApplications(this.userCode).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        // check if found application statistics
        if (data.ResponseData.length > 0)
          this.userApplications = data.ResponseData;
      }
    });
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
