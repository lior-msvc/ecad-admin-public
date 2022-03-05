import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { AppsComponent } from './apps/apps.component'
import { AppInfoComponent } from './app-info/app-info.component'
import { AppsConfigComponent } from './apps-config/apps-config.component'
import { SessionsComponent } from './sessions/sessions.component';
import { UsersComponent } from './users/users.component';
import { SessionDetailsComponent } from './session-details/session-details.component';
import { UserInfoComponent } from './user-info/user-info.component'
import { SearchPageComponent } from './search-page/search-page.component'

const routes: Routes = [
  {
    path: '',
    component: AppsComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'apps',
    component: AppsComponent
  },
  {
    path: 'app-info/:appKey',
    component: AppInfoComponent
  },
  {
    path: 'search/:searchtext',
    component: SearchPageComponent
  },
  {
    path: 'apps-config',
    component: AppsConfigComponent
  },
  {
    path: 'sessions',
    component: SessionsComponent
  },
  {
    path: 'users',
    component: UsersComponent
  }
  ,
  {
    path: 'user-info/:userCode',
    component: UserInfoComponent
  },
  {
    path: 'session-details/:id',
    component: SessionDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }