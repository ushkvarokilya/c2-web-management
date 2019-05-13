import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';

import { CompanyService } from './services/company.service';
import { UserService } from './services/user.service';
import { MessagingService } from './services/messaging.service';
import { ComplexService } from './services/complex.service';
import { AnnouncementService } from './services/announcement.service';
import { NotificationService } from './services/notifactions.service';
import { User } from '../app/store/user/user.interface';
import { setToken } from './store/user/user.ac';
import { Company, complexKeyLocalStorageString } from './store/company/company.interface';
import { setCurrentComplex } from './store/company/company.ac';
import { AppState } from './store/appState';
import { Notifications } from './store/notifications/notifications.interface';
import { Announcement } from './store/announcements/announcements.interface';

import { environment } from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})

export class AppComponent implements OnInit {

  user$
  company$
  unreadNotifications$
  activeAnnouncements$
  unreadCount$

  notificationsNum;

  company: Company;
  isInSetup;

  layerClient;

  loading;

  commercialPageUrl = environment.commercialPageDomain;

  complexListVisible = false
  openDropedownMenu = false;
  

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private messagesService: MessagingService,
    private complexService: ComplexService,
    private announcementService: AnnouncementService,
    private notifactionsService: NotificationService,
    private router: Router,
    private redux: NgRedux<AppState>
  ) {
  }

  ngOnInit() {

    this.user$ = this.redux.select(state => state.user)
    this.company$ = this.redux.select(state => state.company)
    this.unreadNotifications$ = this.redux.select(state => state.notifications.unreadCount)
    this.activeAnnouncements$ = this.redux.select(state => state.announcements.active)
    this.unreadCount$ = this.redux.select(state => state.messages.unreadCount)

    this.company$.subscribe((company: Company) => {
      this.company = company;
    })
    this.initLoggedInUser()
    this.router.events.subscribe((val: RouterEvent) => {
      this.isInSetup = /\/setup\/.*/.test(val.url) || /\/account/.test(val.url)
    })
  }

  private initLoggedInUser() {
    let isInLoggedInScreen = /\/(login|reset_pass|forgot_pass)/.test(location.href)
    if (!localStorage.getItem("user_bridge") && isInLoggedInScreen) {
      return
    }
    this.loading = true;
    this.userService.initUser()
      .then((complexes: any[]) => {
        if (!complexes || complexes.length == 0) {
          this.router.navigate(['setup', 'company']);
        }
        else
          this.initState();
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        if (err.status == 401 || err.noUser || err.status === 400) {
          localStorage.removeItem('user_bridge');
          this.router.navigate(['login']);
        }
      })
  }

  complexChanges(complexIndex: any) {
    let complex = this.redux.getState().company.complexes[complexIndex]
    localStorage.setItem(complexKeyLocalStorageString, complex.key)
    setTimeout(() => location.reload(), 500);
  }

  initState() {
    this.companyService.getDetails();
    // this.complexService.loadCurrentComplexTenants()
    //   .then(() => { }, err => { });
    // this.announcementService.loadAnnouncementsOfCurrentComplex();
    // this.messagesService.initMessages(true);
    // this.notifactionsService.initNotifications();
    // if (environment.production) {
    //   setInterval(() => this.messagesService.initMessages(true), 5000)
    // }
  }

  toggleMenu(type) {
    this[type] = !this[type];
    if (type == "showSettings") this["showLinks"] = false
    else this["showSettings"] = false
  }

  signout() {
    this.userService.signout();
  }

  onDocumentClick(event) {
    Array.prototype.forEach.call(document.getElementsByClassName('dropdown-menu'), (element: HTMLDivElement, index) => {
      let clickedOnDropdown = element.contains(event.target)
      let selectorElement = element.parentElement.getElementsByClassName("selector")[0]
      if (!selectorElement) selectorElement = element.parentElement
      let clickedOnSelector = selectorElement.contains(event.target)

      if (clickedOnDropdown || (!clickedOnSelector && element.style.display !== "none")) {
        element.style.display = "none"
      }
    })
  }

  isInAmenityPage() {
    return /\/amenity\/.*/.test(this.router.url)
  }
}
