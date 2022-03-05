import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common'
import { Subject, Subscription } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  // default constructor
  constructor(private datepipe: DatePipe, private appConfigService: AppConfigService) {
    // set global filter
    this.GlobalFilter = new GlobalFilter(this.datepipe);

    // set environment
    this.CurrentEnvironmnet = appConfigService.environment;
  }

  // sets current page
  public CurrentPage: string = "home";

  // apps view mode
  public AppsViewMode: string = "2";

  // sets current environment
  public CurrentEnvironmnet = "";

  // processing window
  processingWindow_IsVisible: boolean = false;
  processingWindow_Message: string = "";

  // global filter event
  private globalFilterUpdatedSource = new Subject<void>();
  globalFilterUpdated$ = this.globalFilterUpdatedSource.asObservable();
  applyGlobalFilter() {
    this.globalFilterUpdatedSource.next();
  }

  // global filter data
  public GlobalFilter: GlobalFilter = new GlobalFilter(this.datepipe);

  // global settings
  public GlobalSettings: any = null;

  // check if current user is admin
  currentUserIsAdmin(){
    var currentUser = this.findGlobalSetting("CurrentUserName","");
    return (this.appConfigService.adminsList.split(";").indexOf(currentUser) > -1);
  }

  // show processing window
  showProcessingWindow(message: string) {
    this.processingWindow_Message = message;
    this.processingWindow_IsVisible = true;
  }

  // hide processing window
  hideProcessingWindow() {
    setTimeout(() => {
      this.processingWindow_Message = "";
      this.processingWindow_IsVisible = false;
    }, 500);
  }

  // find global setting
  findGlobalSetting(name: string, defaultValue: any) {
    var rv = defaultValue;
    if (this.GlobalSettings != null) {
      rv = this.GlobalSettings[name];
      //this.GlobalSettings.forEach((element) => {
      //  if (element.Key == name) rv = element.Value;
      //});
    }
    return rv;
  }

  // get full applications list (processes and plugins)
  getFullApplicationsList() {
    var rv = [];
    if (this.GlobalSettings != null) {
      // get applications list
      var applicationsList = this.findGlobalSetting('ApplicationsList', []);
      rv = applicationsList.map(val => ({
        Code: val.Code,
        ApplicationName: val.ApplicationName
      }));

      // add plugins list
      var pluginsList = this.findGlobalSetting('PluginsList', []);
      rv = rv.concat(
        pluginsList.map(val => ({
          Code: val.Code,
          ApplicationName: val.PluginName
        }))
      );

    }

    return rv;
  }

  // fix application category name
  fixApplicationCategoryName(applicationCategory: string) {
    // handle null value
    if (applicationCategory == null) return "";

    switch (applicationCategory.toLowerCase()) {
      case "service":
        return "service";
      case "application":
        return "app";
      case "task":
        return "task";
      default:
        return "app";
    }
  }

  // fix application category name
  fixApplicationCategoryName2(applicationCategory: string) {
    // handle null value
    if (applicationCategory == null) return this.fixApplicationCategoryName(applicationCategory);

    switch (applicationCategory.toLowerCase()) {
      case "plugin":
        return "plugin";
      default:
        return this.fixApplicationCategoryName(applicationCategory);
    }
  }

  // fix application icon
  fixApplicationIcon(applicationIcon: string, applicationCategory: string) {
    // handle null value
    //if (applicationIcon == null) return "";

    // make sure that we have value in application icon
    if (applicationIcon != null && applicationIcon != '') return applicationIcon;

    switch (applicationCategory.toLowerCase()) {
      case "service":
        return "service-tab.svg";
      case "application":
        return "application-tab.svg";
      case "task":
        return "task-tab.svg";
      case "plugin":
        return "calendar.svg";
      default:
        return "application-tab.svg";
    }
  }

}

// global filter object
export class GlobalFilter {
  // time range
  TimeRange: string = "Today";
  TimeRangeValues: string[] = ["", "Today", "This Week", "This Month", "Date Range"];

  // time range - apps screen
  TimeRange_Apps: string = "This Month";
  TimeRangeValues_Apps: string[] = ["Today", "This Month", "All"];

  // filters - users screen
  TimeRange_Users: string = "This Month";
  OnlineUsersOnly: boolean = false;
  OnlyUsersWithActivity: boolean = false;

  // application type
  ApplicationType: string = "All";
  ApplicationTypeValues: string[] = ["All", "Service", "Task", "Application"];
  ChangeApplicationType(applicationType: string) {
    this.ApplicationType = applicationType;
  }
  ApplicationType_Apps: string = "All";
  ChangeApplicationType_Apps(applicationType: string) {
    this.ApplicationType_Apps = applicationType;
  }

  // show only online applications
  OnlineApplicationsOnly: boolean = false;
  OnlineApplicationsOnly_Apps: boolean = false;
  FavoriteApplicationsOnly_Apps: boolean = false;

  // application code
  ApplicationCode: string = "";
  ApplicationCode_Apps: string = "";

  // user code
  UserCode: string = "0";

  // free text
  FreeText: string = " ";

  // from date
  FromDate: string = "";

  // to date
  ToDate: string = "";

  // default constructor
  constructor(private datepipe: DatePipe) {
    // set default dates

    this.FromDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    this.ToDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
  }
}
