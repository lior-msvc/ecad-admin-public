import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppConfigService } from './app-config.service';
import { GlobalsService } from "./globals.service"

@Injectable({
  providedIn: 'root'
})
export class ApiGatewayService {

  // base api server address
  private baseApiAssress: string;

  // default constructor
  constructor(private globalsService: GlobalsService, private http: HttpClient, public router: Router, private appConfigService: AppConfigService) {
    // set base api server address
    this.baseApiAssress = appConfigService.apiBaseUrl;
  }

  // post message to api server
  post(apiActionAddress: string, data: any = null) {
    // set http options
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }),
      withCredentials: true
    };
    
    // set default data
    if (data == null) data = {};  
    data["environment"] = this.globalsService.CurrentEnvironmnet;
    var requestDataAsString = "unique_request_guid=" + Date.now();

    // convert data object to string
    for (let key of Object.keys(data)) {
      let value = data[key];
      requestDataAsString = requestDataAsString + "&" + key + "=" +  encodeURIComponent(value);
    }

    // set full url
    var url = this.baseApiAssress + apiActionAddress;

    // send post request to server
    return this.http.post(url ,requestDataAsString , httpOptions);
  }

}
