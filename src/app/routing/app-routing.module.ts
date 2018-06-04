import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginGuard } from "./guards/login.guard";
import { AuthGuard } from "./guards/auth.guard";

import { OverviewComponent } from '../components/overview/overview.component';
import { LoginComponent } from "../components/login/login.component";
import { MaintenancePageComponent } from '../components/maintenance/maintenance.component';
import { FacilityPageComponent } from '../components/facility/facility.component';
import { VendorsPageComponent } from '../components/vendors/vendors.component';
import { CollectionPageComponent } from '../components/collection/collection.component';
import { TenantsPageComponent } from '../components/tenants/tenants.component';
import { MessagingComponent } from '../components/messaging/messaging.component';
import { SetupCompanyPageComponent } from '../components/setup/setup.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { AnnouncementsComponent } from '../components/announcements/announcements.component';
import { AccountDetailsComponent } from '../components/account-details/account-details.component';
import { PageNotFoundComponent } from '../components/page-not-found/page-not-found.component';;
import { AmenityComponent } from "../components/amenity/amenity.component";
import { ResetPasswordComponent } from "../components/reset-password/reset-password.component";
import { ForgotPasswordComponent } from "../components/forgot-password/forgot-password.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', component: PageNotFoundComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'forgot_pass', component: ForgotPasswordComponent, canActivate: [LoginGuard] },
  { path: 'reset_pass', component: ResetPasswordComponent },
  { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard] },
  { path: 'facility', component: FacilityPageComponent, canActivate: [AuthGuard] },
  { path: 'maintenance', component: MaintenancePageComponent, canActivate: [AuthGuard] },
  { path: 'vendors', component: VendorsPageComponent, canActivate: [AuthGuard] },
  { path: 'tenants', component: TenantsPageComponent, canActivate: [AuthGuard] },
  { path: 'collection', component: CollectionPageComponent, canActivate: [AuthGuard] },
  { path: 'messaging', component: MessagingComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'setup/company', component: SetupCompanyPageComponent, canActivate: [AuthGuard] },
  { path: 'announcements', component: AnnouncementsComponent, canActivate: [AuthGuard] },
  { path: 'amenity/:key', component: AmenityComponent, canActivate: [AuthGuard] },
  { path: 'account', component: AccountDetailsComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

export const routing = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [LoginGuard, AuthGuard],
  exports: [RouterModule]
})
export class AppRoutingModule { }
