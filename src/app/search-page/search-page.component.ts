import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ApiDataAccessService } from '../services/api-data-access.service';
import { GlobalsService } from "../services/globals.service"
import { switchMap } from 'rxjs/operators';
import { DatePipe, DOCUMENT } from '@angular/common'
import { LogsGridDataService } from '../services/grid-data-services.service';
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
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  // search text
  searchText: string = "";

  // reference to logs grid
  @ViewChild('logsGrid') private logsGrid;

  // logs filters
  logLevel: number = 0;
  source: string = "";

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

  // sessionsLoaded subscription
  logsLoadedSubscription: Subscription;

  // applications list
  applications: any[] = [];

  // users list
  users: any[] = [];

  // default constructor
  constructor(private logsGridDataService: LogsGridDataService, public globalsService: GlobalsService, private route: ActivatedRoute, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe) {
    // set current page
    this.globalsService.CurrentPage = "search-page";

    // load logs
    this.viewLogs = logsGridDataService;

    // data loaded event
    this.logsLoadedSubscription = this.logsGridDataService.dataFetchCompleted$.subscribe(
      data => {
        if (data == "Logs") {
          // hide loading... window
          CloseLoadingModal();

          // search applications - in this place it is probably after global service data was loaded
          this.applications = [...this.globalsService.findGlobalSetting('FullApplicationsList', [])].filter(obj =>
            obj.Name.toString().toLowerCase().includes(this.searchText.toString().toLowerCase())
            || obj.AssemblyName.toString().toLowerCase().includes(this.searchText.toString().toLowerCase())
            || obj.Description.toString().toLowerCase().includes(this.searchText.toString().toLowerCase())
          );

          // search users - in this place it is probably after global service data was loaded
          this.users = [...this.globalsService.findGlobalSetting('UsersList', [])].filter(obj =>
            obj.UserDomain.toString().toLowerCase().includes(this.searchText.toString().toLowerCase())
            || obj.UserName.toString().toLowerCase().includes(this.searchText.toString().toLowerCase())
          );
        }
      });
  }

  ngOnInit() {
    // get search text
    this.searchText = this.route.snapshot.paramMap.get('searchtext');

    // init Common
    InitCommon();

    // scroll to top of page
    window.scroll(0, 0);

    // search data
    this.doSearch();
  }

  // search data
  doSearch() {
    // validate search text
    if (this.searchText == "") return;

    // load logs list
    this.reloadLogsList(true);
  }

  // reload logs
  reloadLogsList(resetPage: boolean = false) {
    // show loading... window
    OpenLoadingModal();

    // reset page
    if (resetPage) this.stateLogs.skip = 0;

    // load data
    this.logsGridDataService.query(this.stateLogs, {
      serverCode: 0,
      userCode: 0,
      processCode: 0,
      pluginCode: 0,
      source: this.source,
      searchText: this.searchText,
      logLevel: this.logLevel,
      sessionId: "",
      fromDate: "2000-01-01",
      toDate: "2100-01-01"
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

  // return total sessions
  getTotalLogs() {
    let logsDataSource: any = this.viewLogs;
    if (logsDataSource == null) return "...";
    if (logsDataSource.value == null) return "...";
    return logsDataSource.value.total
  }

}
