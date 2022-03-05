import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, LocationStrategy, HashLocationStrategy, DatePipe} from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopupModule } from '@progress/kendo-angular-popup';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AppsComponent } from './apps/apps.component';
import { GlobalFilterComponent } from './global-filter/global-filter.component';
import { AppConfigService } from '../app/services/app-config.service';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { SessionsGridDataService, LogsGridDataService, SessionLogsGridDataService } from '../app/services/grid-data-services.service';
import { AppInfoComponent } from './app-info/app-info.component';
import { AppConfigEntryComponent } from './app-config-entry/app-config-entry.component';
import { HttpErrorInterceptor } from './services/http-error-interceptor.service';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { AppsConfigComponent } from './apps-config/apps-config.component';
import { SessionsComponent } from './sessions/sessions.component';
import { UsersComponent } from './users/users.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

import 'hammerjs';
import { SessionDetailsComponent } from './session-details/session-details.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { SearchPageComponent } from './search-page/search-page.component';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    AppsComponent,
    GlobalFilterComponent,
    AppInfoComponent,
    AppConfigEntryComponent,
    AppsConfigComponent,
    SessionsComponent,
    UsersComponent,
    SessionDetailsComponent,
    UserInfoComponent,
    SearchPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DialogsModule,
    BrowserAnimationsModule,
    PopupModule,
    ButtonsModule,
    FormsModule,
    HttpClientModule,
    DropDownsModule,
    GridModule,
    ChartsModule,
    DateInputsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        return () => {
          //Make sure to return a promise!
          return appConfigService.loadAppConfig();
        };
      }
    },
    {
      provide : LocationStrategy , 
      useClass: HashLocationStrategy
    },
    DatePipe,
    SessionsGridDataService,
    LogsGridDataService,
    SessionLogsGridDataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
