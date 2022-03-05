import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private appConfig: any;

  constructor(private http: HttpClient) { }

  public loadAppConfig() {
    return this.http.get('./assets/config/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;

        // write log
        console.log("loaded config");
      });
  }

  // get admin api base url
  get apiBaseUrl() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig.apiBaseUrl;
  }

  // get version
  get version() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig.version;
  }

  // get environment
  get environment() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig.environment;
  }

  // get admins list
  get adminsList() {

    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return this.appConfig.admins_list;
  }
}