import { Component, OnInit } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { Subscription }   from 'rxjs';
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
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {
  // global filter update subscription
  //globalFilterUpdateSubscription: Subscription;

  // applications statistics
  applicationsStatistics: any[];
  applicationsStatisticsIndexes: any[];

  // default constructor
  constructor(public globalsService: GlobalsService, private apiDataAccessService: ApiDataAccessService, public datepipe: DatePipe) {
    // set current page
    this.globalsService.CurrentPage = "apps";

    // set empty arrays
    this.applicationsStatistics = <any[]>[];
    this.applicationsStatisticsIndexes = <any[]>[];

    //// global filter updated event
    //this.globalFilterUpdateSubscription = this.globalsService.globalFilterUpdated$.subscribe(
    //  astronaut => {
    //    alert('global filter updated - from apps screen');
    //});
   }

  ngOnInit() {
    // init Apps
    InitApps(this.globalsService.AppsViewMode);

    // init Common
    InitCommon();

    // close loading modal
    //OpenLoadingModal();

    // reload applications statistics
    this.reloadApplicationsStatistics();
  }

  ngOnDestroy() {
    //// prevent memory leak when component destroyed
    //this.globalFilterUpdateSubscription.unsubscribe();
  }

  // change application type filter
  changeApplicationTypeFilter(applicationType: string){
    // update apps application type filter
    this.globalsService.GlobalFilter.ChangeApplicationType_Apps(applicationType);

    // reload applications statistics 
    this.reloadApplicationsStatistics();
  }

  // reload applications statistics 
  reloadApplicationsStatistics(){
    // show loading... window
    OpenLoadingModal();
    this.applicationsStatisticsIndexes = [];
    this.apiDataAccessService.applications_getApplicationsStatistics(this.globalsService.GlobalFilter.TimeRange_Apps, this.globalsService.GlobalFilter.ApplicationCode_Apps, this.globalsService.GlobalFilter.OnlineApplicationsOnly_Apps, true, this.globalsService.GlobalFilter.ApplicationType_Apps).then((data: any) => {
        // check if we got successful response
        if (data != null && data.ResponseData != null) {
          // filter favorite apps
          if (this.globalsService.GlobalFilter.FavoriteApplicationsOnly_Apps){
            data.ResponseData = data.ResponseData.filter(item => item.IsFavoriteForUser);
          }

          this.applicationsStatistics = data.ResponseData;
          this.applicationsStatisticsIndexes = Array.from(Array(this.applicationsStatistics.length).keys());
          
          // hide loading... window
          CloseLoadingModal();
        }
      });
  }

  // update user favorite application
  updateUserFavoriteApplication(application: any)
  {
    application.IsFavoriteForUser =! application.IsFavoriteForUser;

    this.apiDataAccessService.users_setUserFavoriteApplication(this.globalsService.findGlobalSetting("CurrentUserName",""), application.Key,application.IsFavoriteForUser);
  }
}
