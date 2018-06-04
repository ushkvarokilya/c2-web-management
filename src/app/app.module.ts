import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import { NgReduxModule, DevToolsExtension, NgRedux } from "@angular-redux/store";
import { createStore, Store } from "redux";
import { AppRoutingModule } from './routing/app-routing.module';

import { rootReducer } from './store/root.reducer';
import * as IAppState from './store/appState';

//pipes
import { SearchTicketPipe } from './pipes/search-ticket.pipe';
import { SearchTenantstPipe } from './pipes/search-tenants.pipe';
import { SearchAptByNamePipe } from './pipes/search-apt-by-name.pipe';
import { SearchAnnouncementPipe } from './pipes/search-announcement.pipe';
import { SearchTenantsForMessagingPipe } from './pipes/search-tenants-for-messaging.pipe';
import { FilterNameExistPipe } from './pipes/filter-name-exist.pipe';
import { FilterByStatusPipe } from './pipes/filter-by-status.pipe';
import { SearchVendorsPipe } from './pipes/search-vendor.pipe';
import { FilterVendorProfessionPipe } from './pipes/filter-vendor-profession.pipe';
import { SortByPipe } from './pipes/sort-by.pipe';
import { SearchCollectionPipe } from './pipes/search-collection.pipe';
import { DateRangePipe } from "./pipes/date-range.pipe";
import { FilterLeasePipe } from "./pipes/filter-lease.pipe";
import { FilterRolesPipe } from "./pipes/filter-role.pipe";
import { TenantsToBuildingsPipe } from "./pipes/tenants-to-buildings.pipe";
import { GetTenantByKeyPipe } from "./pipes/get-tenant-by-key.pipe";
import { ShowInviteesReservationPipe } from "./pipes/show-invitees-reservation.pipe";

//components
import { AppComponent } from './app.component';
import { AccountDetailsComponent } from './components/account-details/account-details.component';
import { AnnouncementsComponent } from "./components/announcements/announcements.component";
import { AmenityComponent } from "./components/amenity/amenity.component";
import { CollectionPageComponent } from "./components/collection/collection.component";
import { PaymentItemComponent } from "./components/collection/payment-item/payment-item.component";
import { FacilityPageComponent } from "./components/facility/facility.component";
import { FacilityAmenitiesComponent } from "./components/facility/facility-aminities/facility-amenities.component";
import { FacilityCalendarComponent } from "./components/facility/facility-calendar/facility-calendar.component";
import { FacilityUnitsComponent } from "./components/facility/facility-units/facility-units.component";
import { MaintenancePageComponent } from "./components/maintenance/maintenance.component";
import { MessagingComponent } from "./components/messaging/messaging.component";
import { GroupViewComponent } from "./components/messaging/group-view/group-view.component";
import { NotificationsComponent } from "./components/notifications/notifications.component";
import { OverviewComponent } from "./components/overview/overview.component";
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
import { SetupCompanyPageComponent } from "./components/setup/setup.component";
import { CompanyDetailsComponent } from "./components/setup/company-details/company-details.component";
import { UsersAndRolesComponent } from "./components/setup/users-and-roles/users-and-roles.component";
import { FacilitiesComponent } from "./components/setup/facilities-details/facilities-details.component";
import { DatepickerComponent } from "./components/shared/datepicker/datepicker.component";
import { MenulistComponent } from "./components/shared/menulist/menulist.component";
import { ModalComponent } from "./components/shared/modal/modal.component";
import { TenantsPageComponent } from "./components/tenants/tenants.component";
import { AddTenantComponent } from "./components/tenants/add-tenant/add-tenant.component";
import { TenantsViewComponent } from "./components/tenants/tenants-view/tenants-view.component";
import { VendorsPageComponent } from "./components/vendors/vendors.component";

//services
import { AppHttpService } from "./services/shared/http";
import { AmenityService } from "./services/amenity.service";
import { AnnouncementService } from "./services/announcement.service";
import { CalendarService } from "./services/calendar.service";
import { CompanyService } from "./services/company.service";
import { ComplexService } from "./services/complex.service";
import { MaintenanceService } from "./services/maintenance.service";
import { MessagingService } from "./services/messaging.service";
import { NotificationService } from "./services/notifactions.service";
import { UserService } from "./services/user.service";
import { VendorService } from "./services/vendor.service";
import { ImageUploadComponent } from './components/shared/image-upload/image-upload.component';
import { LoginComponent } from './components/login/login.component';
import { ToggleComponent } from './components/shared/toggle/toggle.component';
import { TenantService } from './services/tenant.service';
import { FilterUnitTypesByBuildingPipe } from './pipes/filter-unit-types-by-building.pipe';
import { GoogleAddressComponent, ExtractGoogleAddressPipe } from './components/shared/google-address/google-address.component';
import { StringValidationService } from "./services/string-validation.service";

import { environment } from "../environments/environment";
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { OpeningHoursComponent } from './components/setup/shared/opening-hours/opening-hours.component';
import { FilterUsedProfessionsPipe } from './pipes/filter-used-professions.pipe';

@NgModule({
  imports: [
    BrowserModule,
    NgReduxModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AccountDetailsComponent,
    AnnouncementsComponent,
    CollectionPageComponent,
    AmenityComponent,
    PaymentItemComponent,
    FacilityPageComponent,
    FacilityAmenitiesComponent,
    FacilityCalendarComponent,
    FacilityUnitsComponent,
    MaintenancePageComponent,
    MessagingComponent,
    GroupViewComponent,
    NotificationsComponent,
    OverviewComponent,
    PageNotFoundComponent,
    SetupCompanyPageComponent,
    CompanyDetailsComponent,
    UsersAndRolesComponent,
    FacilitiesComponent,
    DatepickerComponent,
    MenulistComponent,
    ModalComponent,
    TenantsPageComponent,
    AddTenantComponent,
    TenantsViewComponent,
    VendorsPageComponent,
    //pipes
    SearchTicketPipe,
    SearchTenantstPipe,
    SearchAptByNamePipe,
    SearchAnnouncementPipe,
    SearchTenantsForMessagingPipe,
    FilterNameExistPipe,
    FilterByStatusPipe,
    SearchVendorsPipe,
    FilterVendorProfessionPipe,
    SortByPipe,
    SearchCollectionPipe,
    DateRangePipe,
    FilterLeasePipe,
    FilterRolesPipe,
    TenantsToBuildingsPipe,
    GetTenantByKeyPipe,
    ShowInviteesReservationPipe,
    ExtractGoogleAddressPipe,
    ImageUploadComponent,
    LoginComponent,
    ToggleComponent,
    FilterUnitTypesByBuildingPipe,
    GoogleAddressComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    OpeningHoursComponent,
    FilterUsedProfessionsPipe
  ],
  providers: [
    AppHttpService,
    DevToolsExtension,
    AmenityService,
    AnnouncementService,
    CalendarService,
    CompanyService,
    ComplexService,
    MaintenanceService,
    MessagingService,
    NotificationService,
    UserService,
    VendorService,
    TenantService,
    StringValidationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(redux: NgRedux<IAppState.AppState>,
    private devTools: DevToolsExtension
  ) {

    let enhancers
    if (devTools.isEnabled()) {
      enhancers = [devTools.enhancer()];
    }

    let store = createStore(
      rootReducer,
      IAppState.initialState,
      ...enhancers
    ) as Store<any>

    redux.provideStore(store)

    this.importGoogleScript()

  }

  private importGoogleScript() {
    let node = document.createElement('script');
    node.id = "googleMapsScript";
    node.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.google_api_key + '&libraries=places';
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('body')[0].appendChild(node);
  }
}
