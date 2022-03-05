import { Component, OnInit } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { ApiDataAccessService } from '../../app/services/api-data-access.service';
import { DatePipe } from '@angular/common'

// init Apps
declare function InitApps(viewMode): any;

// init Common
declare function InitCommon(): any;

// open & close loading modal window
declare function OpenLoadingModal(): any;
declare function CloseLoadingModal(): any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  // users statistics
  usersStatistics: any[];
  usersStatisticsWithFilters: any[];
  usersStatisticsIndexes: any[];

  // filters
  freeTextSearch: string = "";

  // default constructor
  constructor(public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe) {
    // set current page
    this.globalsService.CurrentPage = "users";

    // set empty arrays
    this.usersStatistics = <any[]>[];
    this.usersStatisticsWithFilters = <any[]>[];
    this.usersStatisticsIndexes = <any[]>[];
  }

  ngOnInit() {
    // init Apps
    InitApps(this.globalsService.AppsViewMode);

    // init Common
    InitCommon();

    // reload users statistics
    this.reloadUsersStatistics();
  }

  // reload users statistics 
  reloadUsersStatistics() {
    // show loading... window
    OpenLoadingModal();
    this.usersStatisticsIndexes = [];
    this.apiDataAccessService.users_getUsersStatistics(this.globalsService.GlobalFilter.TimeRange_Users).then((data: any) => {
      // check if we got successful response
      if (data != null && data.ResponseData != null) {
        this.usersStatistics = data.ResponseData;

        // apply filters
        this.applyFilters();

        // hide loading... window
        CloseLoadingModal();

        // delay
        setTimeout(() => {
          // re-enable user box hover
          InitApps(this.globalsService.AppsViewMode);
        }, 1000);
      }
    });
  }

  // on free text change event
  onFreeTextChange(freeText){
    this.freeTextSearch = freeText;
    this.applyFilters();
  }

  // apply filters
  applyFilters(){
    // reset data
    this.usersStatisticsWithFilters = <any[]>[];
    this.usersStatisticsIndexes = <any[]>[];

    // check if we got data
    if (this.usersStatistics.length == 0) return;

    // apply filters
    this.usersStatisticsWithFilters = [...this.usersStatistics];
    if (this.globalsService.GlobalFilter.OnlineUsersOnly) this.usersStatisticsWithFilters = this.usersStatisticsWithFilters.filter(obj => obj.ActiveSessionsNumber > 0);
    if (this.globalsService.GlobalFilter.OnlyUsersWithActivity) this.usersStatisticsWithFilters = this.usersStatisticsWithFilters.filter(obj => obj.UniqueAppsNumber > 0);
    if (this.freeTextSearch != "") this.usersStatisticsWithFilters = this.usersStatisticsWithFilters.filter(obj => 
      obj.UserDomain.toString().toLowerCase().includes(this.freeTextSearch.toString().toLowerCase())
      || obj.UserName.toString().toLowerCase().includes(this.freeTextSearch.toString().toLowerCase())
      || obj.Properties.English_FullName.toString().toLowerCase().includes(this.freeTextSearch.toString().toLowerCase())
      || obj.Properties.Hebrew_FullName.toString().toLowerCase().includes(this.freeTextSearch.toString().toLowerCase())
    );

    // set indexes
    this.usersStatisticsIndexes = Array.from(Array(this.usersStatisticsWithFilters.length).keys());

  }

}
