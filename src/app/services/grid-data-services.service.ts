import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { toODataString } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiGatewayService } from '../../app/services/api-gateway.service';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export abstract class GridDataServicesService extends BehaviorSubject<GridDataResult> {
    // set if data is being loaded
    public loading: boolean;

    // global filter event
    private dataFetchCompleted = new Subject<string>();
    dataFetchCompleted$ = this.dataFetchCompleted.asObservable();
    private raiseDataFetchCompleted(entityName: string) {
        this.dataFetchCompleted.next(entityName);
    }

    // default constructor
    constructor(
        private http: HttpClient,
        private apiGatewayService: ApiGatewayService
    ) {
        super(null);
    }

    // query data
    public _query(entityName: string, state: any, params: any = {}): void {
        this.fetch(entityName, state, params)
            .subscribe(x => super.next(x));
    }

    // actual fetch data
    protected fetch(entityName: string, state: any, params: any): Observable<GridDataResult> {
        this.loading = true;

        // set params object
        let requestParams: any = params;
        requestParams.skip = state.skip;
        requestParams.pageSize = state.take;
        if (state.sort != null && state.sort.length > 0 && state.sort[0].field != null && state.sort[0].dir != null) {
            requestParams.sortField = state.sort[0].field;
            requestParams.sortDir = state.sort[0].dir;
        }

        console.log(`start loading [${entityName}], params:`, requestParams);

        var rowIndex: number = 0;
        return this.apiGatewayService.post(this.resolveEntityNameUrl(entityName), requestParams)
            .pipe(
                map(response => (<GridDataResult>{
                    //data: response['ResponseData'],
                    data: response['ResponseData'].map((obj: any) => {
                        // set row index
                        obj._rowindex =rowIndex;
                        rowIndex ++;

                        // fix date objects
                        if (obj.CreateTime != null) obj.CreateTime = new Date(obj.CreateTime);
                        if (obj.OpenTime != null) obj.OpenTime = new Date(obj.OpenTime);
                        if (obj.LastPingTime != null) obj.LastPingTime = new Date(obj.LastPingTime);
                        if (obj.CloseTime != null) obj.CloseTime = new Date(obj.CloseTime);

                        // calculate session time
                        if (entityName == "Sessions" && obj.OpenTime != null) obj.SessionTime = this.calculateSessionTime(new Date(obj.OpenTime), obj.CloseTime);

                        return obj;
                    }),
                    total: response['ExtraResponseData']
                })),
                tap((response) => {
                    this.loading = false;
                    console.log(`finish loading [${entityName}] (${response.data.length} records)`);
                    this.raiseDataFetchCompleted(entityName);
                })
            );
    }

    // calculate session time
    private calculateSessionTime(openTime: Date, closeTime: Date) {
        if (closeTime == null)
            closeTime = new Date();
        else
            closeTime = new Date(closeTime);

        return (new Date(closeTime.getTime() - openTime.getTime())).toISOString().substr(11, 8);
    }

    // return url from entity name
    private resolveEntityNameUrl(entityName: string): string {
        if (entityName == "Sessions") return "/sessions/sessions-list";
        if (entityName == "Logs") return "/logs/logs-analysis-list";
        if (entityName == "SessionLogs") return "/logs/session-logs-list";

        // throw error for invalid entity name
        throw new Error('Invalid entity name: ' + entityName);
    }
}

@Injectable()
export class SessionsGridDataService extends GridDataServicesService {
    constructor(http: HttpClient, apiGatewayService: ApiGatewayService) {
        super(http, apiGatewayService);
    }

    // query data
    public query(state: any, params: any = {}): void {
        this._query("Sessions", state, params);
    }
}

@Injectable()
export class LogsGridDataService extends GridDataServicesService {
    constructor(http: HttpClient, apiGatewayService: ApiGatewayService) {
        super(http, apiGatewayService);
    }

    // query data
    public query(state: any, params: any = {}): void {
        this._query("Logs", state, params);
    }
}

@Injectable()
export class SessionLogsGridDataService extends GridDataServicesService {
    constructor(http: HttpClient, apiGatewayService: ApiGatewayService) {
        super(http, apiGatewayService);
    }

    // query data
    public query(state: any, params: any = {}): void {
        this._query("SessionLogs", state, params);
    }
}
