import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiGatewayService } from '../../app/services/api-gateway.service';
import { BehaviorSubject, Observable } from 'rxjs';
//import 'rxjs/add/observable/of';
//import 'rxjs/add/operator/catch'; 

@Injectable({
  providedIn: 'root'
})
export class ApiDataAccessService {
  // default constructor
  constructor(private apiGatewayService: ApiGatewayService) { }

  /* ---------------- COMMON METHODS ------------------*/
  // get global settings
  common_getGlobalSettings(): Promise<any> {
    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/shareddata/global-settings", null).subscribe(
        (data: any) => {
          // return data
          resolve(data);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END COMMON METHODS ------------------*/

  /* ---------------- APPLICATIONS METHODS ------------------*/
  // get applications statistics
  applications_getApplicationsStatistics(datesRangeType: string, applicationKey: string = "", onlyOnlineUsers: boolean = false, onlyApplicationsWithActivity: boolean = true, applicationCategory: string = "All"): Promise<any> {

    // datesRangeType, applicationKey , onlyOnlineUsers ("0"/"1"), onlyApplicationsWithActivity ("0"/"1")
    let params: any = {};
    params.datesRangeType = datesRangeType;
    params.applicationKey = applicationKey;
    params.onlyOnlineUsers = onlyOnlineUsers ? "1" : "0";
    params.onlyApplicationsWithActivity = onlyApplicationsWithActivity ? "1" : "0";
    params.applicationCategory = applicationCategory;
    //params.fromDate = '2018-01-01';
    //params.toDate = '2021-01-01';

    // write log
    console.log("start loading applications statistics, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/applications/applications-statistics", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded applications statistics (${data.ResponseData.length} applications)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // update application details
  applications_updateApplicationDetails(processCode: number, applicationName: string, applicationCategory: string, applicationDescription: string, applicationUrl: string, applicationIcon: string): Promise<any> {
    // int , string , string , string , string , string 
    let params: any = {};
    params.code = processCode;
    params.applicationName = applicationName;
    params.applicationCategory = applicationCategory;
    params.applicationDescription = applicationDescription;
    params.applicationUrl = applicationUrl;
    params.applicationIcon = applicationIcon;

    // write log
    console.log("updating application details, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/shareddata/update-process", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END APPLICATIONS METHODS ------------------*/

  /* ---------------- SESSIONS METHODS ------------------*/
  // get sessions list
  sessions_getSessionsList(datesRangeType: string, fromDate: string, toDate: string, serverCode: string, userCode: string, applicationKey: string, onlyOnlineUsers: boolean = false, onlySessionsWithErrors: boolean = false, skip: Number = 0, pageSize: Number = 100, sortField: string = "OpenTime", sortDir: string = "asc"): Promise<any> {

    let params: any = {};
    params.datesRangeType = datesRangeType;
    params.fromDate = fromDate;
    params.toDate = toDate;
    params.serverCode = serverCode;
    params.userCode = userCode;
    params.onlyOnlineUsers = onlyOnlineUsers ? "1" : "0";
    params.onlySessionsWithErrors = onlySessionsWithErrors ? "1" : "0";
    params.skip = skip;
    params.pageSize = pageSize;
    params.sortField = sortField;
    params.sortDir = sortDir;
    if (applicationKey.startsWith("Process-")) {
      params.processCode = Number(applicationKey.replace("Process-", ""));
      params.pluginCode = 0;
    }
    else if (applicationKey.startsWith("Plugin-")) {
      params.processCode = 0;
      params.pluginCode = Number(applicationKey.replace("Plugin-", ""));
    }
    else {
      params.processCode = 0;
      params.pluginCode = 0;
    }

    // write log
    console.log("start loading sessions list, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/sessions/sessions-list", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded sessions list (${data.ResponseData.length} sessions)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // get session details
  sessions_getSessionDetails(sessionId: string): Promise<any> {

    let params: any = {};
    params.sessionId = sessionId;

    // write log
    console.log("start loading session details, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/sessions/session-details", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded session details: `, data.ResponseData);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // get sessions per day
  sessions_getSessionsPerDay(fromDate: string, toDate: string, userCode: string, processCode: string, pluginCode: string): Promise<any> {

    let params: any = {};
    params.fromDate = fromDate;
    params.toDate = toDate;
    params.userCode = userCode;
    params.processCode = processCode;
    params.pluginCode = pluginCode;

    // write log
    console.log("start loading sessions per day, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/sessions/sessions-per-day", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded sessions per day: `, data.ResponseData);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END SESSIONS METHODS ------------------*/

  /* ---------------- LOGS METHODS ------------------*/
  // get log entry details
  logs_getLogEntryDetails(logEntry: any): Promise<any> {

    let params: any = {};
    params.sessionId = logEntry.SessionId;
    params.referenceId = logEntry.ExtraData_KeyValue.split(';').find(element => element.includes('ReferenceId =')).split("=", 2)[1].trim();

    // set url
    var url: string = "";
    if (logEntry.LogLevel == 5) url = "/audit/find-audit-record-by-reference-id";
    if (logEntry.LogLevel == 6) url = "/errors/find-error-record-by-reference-id";
    if (logEntry.LogLevel == 7) url = "/emails/find-email-audit-record-by-reference-id";

    // write log
    console.log("start loading log entry details, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post(url, params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded log entry details: `, data.ResponseData);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END LOGS METHODS ------------------*/

  /* ---------------- APPS CONFIG METHODS ------------------*/
  // get apps config list
  appsconfig_getAppsConfigList(applicationKey: string): Promise<any> {

    let params: any = {};
    if (applicationKey.startsWith("Process-")) {
      params.processCode = Number(applicationKey.replace("Process-", ""));
      params.pluginCode = 0;
    }
    else if (applicationKey.startsWith("Plugin-")) {
      params.processCode = -1;
      params.pluginCode = Number(applicationKey.replace("Plugin-", ""));
    }
    else {
      params.processCode = -1;
      params.pluginCode = 0;
    }

    // write log
    console.log("start loading apps config list, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/appsconfig/apps-config-list", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          if (data.ResponseData != null) console.log(`loaded apps config list (${data.ResponseData.length} entries)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // delete app config entry
  appsconfig_deleteAppConfigEntry(recordId: string): Promise<any> {

    let params: any = {};
    params.recordId = recordId;

    // write log
    console.log("delete app config entry, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/appsconfig/delete-apps-config", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // create/update app config entry
  appsconfig_updateAppConfigEntry(appConfigEntry: any): Promise<any> {
    let params: any = {};
    params.serverCode = appConfigEntry.ServerCode;
    params.userCode = appConfigEntry.UserCode;
    params.processCode = appConfigEntry.ProcessCode;
    params.pluginCode = appConfigEntry.PluginCode;
    params.configGroup = appConfigEntry.ConfigGroup;
    params.configKey = appConfigEntry.ConfigKey;
    params.configValue = appConfigEntry.ConfigValue;
    params.configDescription = appConfigEntry.ConfigDescription;
    if (appConfigEntry.RecordId > 0) {
      // update app config entry
      params.recordId = appConfigEntry.RecordId;
      params.status = appConfigEntry.Status;
    }

    // write log
    console.log("creata/update app config entry, params:", params);

    // set app config url
    var url: string = "";
    if (appConfigEntry.RecordId == 0)
      url = "/appsconfig/create-apps-config";
    else
      url = "/appsconfig/update-apps-config";

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post(url, params).subscribe(
        (data: any) => {
          // return data
          resolve(data);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // get apps config usage list
  appsconfig_getAppsConfigUsageList(sessionId: string): Promise<any> {

    let params: any = {};
    params.sessionId = sessionId;
    params.serverCode = 0;
    params.userCode = 0;
    params.processCode = 0;
    params.pluginCode = 0;

    // write log
    console.log("start loading apps config usage list, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/appsconfig/apps-config-usage-list", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          if (data.ResponseData != null) console.log(`loaded apps config usage list (${data.ResponseData.length} entries)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END APPS CONFIG METHODS ------------------*/

  /* ---------------- USERS METHODS ------------------*/
  // get users statistics
  users_getUsersStatistics(datesRangeType: string, userCode: string = "0"): Promise<any> {

    // datesRangeType,
    let params: any = {};
    params.datesRangeType = datesRangeType;
    params.userCode = userCode

    // write log
    console.log("start loading users statistics, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/shareddata/users-statistics", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);

          // write log
          console.log(`loaded users statistics (${data.ResponseData.length} users)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // get user applications
  users_getUserApplications(userCode: string = "0"): Promise<any> {

    // datesRangeType,
    let params: any = {};
    params.userCode = userCode

    // write log
    console.log("start loading user applications, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/shareddata/user-applications", params).subscribe(
        (data: any) => {
          data.ResponseData = data.ResponseData.map((obj: any) => {
            // fix date objects
            if (obj.LatestRunDate != null) obj.LatestRunDate = new Date(obj.LatestRunDate);

            return obj;
          })

          // return data
          resolve(data);

          // write log
          console.log(`loaded user applications (${data.ResponseData.length} applications)`);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }

  // get user applications
  users_setUserFavoriteApplication(userName: string, applicationKey: string, isFavorite: boolean): Promise<any> {

    // datesRangeType,
    let params: any = {};
    params.userName = userName;
    params.applicationKey = applicationKey;
    params.isFavorite = isFavorite ? "1" : "0";

    // write log
    console.log("updating user favorite application, params:", params);

    return new Promise<number>((resolve) => {
      this.apiGatewayService.post("/shareddata/set-user-favorite-application", params).subscribe(
        (data: any) => {
          // return data
          resolve(data);
        },
        error => {
          // do nothing
          resolve(null);
        },
        () => {
          // finally - always called
        })
    });
  }
  /* ---------------- END USERS METHODS ------------------*/
}
