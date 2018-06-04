import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { NgRedux } from "@angular-redux/store";
import { ActivatedRoute } from "@angular/router";
import { ElementRef } from '@angular/core';

import "rxjs/add/operator/map";

import { ActivityMode } from "../setup/shared/opening-hours/opening-hours.component";
import { DefaultAmenities } from "../setup/facilities-details/facilities-details.component";
import { AmenityService } from "../../services/amenity.service";
import { User } from "../../store/user/user.interface";
import { Complex, Tenant } from "../../store/company/company.interface";
import { AppState } from '../../store/appState';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-amenity',
  templateUrl: './amenity.component.html',
  styleUrls: ['./amenity.component.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class AmenityComponent implements OnInit {

  user$: Observable<User>
  currentComplex$: Observable<Complex>

  amenity: Amenity

  DefaultAmenities = DefaultAmenities
  ActivityMode = ActivityMode

  constructor(private activeRoute: ActivatedRoute, private amenityService: AmenityService, private redux: NgRedux<AppState>) {
    this.hours = []
    for (let i = 1; i <= 23; i++) this.hours.push(i)
    this.minutes = []
    for (let i = 0; i <= 59; i++) this.minutes.push(i)

    this.initCal()
  }

  ngOnInit() {

    this.currentComplex$ = this.redux.select(state => state.company.currentComplex)
    this.user$ = this.redux.select(state => state.user)

    this.activeRoute.params
      .map(params => params['key'])
      .subscribe(key => {
        this.amenityService.getAmenity(key)
          .then((data: any) => {
            this.amenity = data
            this.amenity.key = key
            this.loadCalendar()

            // this.amenity = {
            //   activityMode: "always_open",
            //   announcements: [],
            //   directions: "asd",
            //   imagesUrl: ["https://i.imgur.com/ejF5965.jpg", "https://i.imgur.com/AzRcf8t.jpg"],
            //   key,
            //   openingHours: [],
            //   name: "bbq",
            //   reservable: true,
            //   rules: ["asd"],
            //   selectedManagers: [{
            //     email: "email@email.com",
            //     fullName: "Some Manager",
            //     imageUrl: "https://i.imgur.com/AzRcf8t.jpg",
            //     phoneNumber: "12213123"
            //   }],
            //   timeLimit: 1,
            //   timeLimitOption: true,
            //   timeLimitUnit: "hours"
            // }
          })
      })
    this.initNewEvent()
    this.initNewAnnou()
    this.initNewEventTimes()
  }

  getDayName(number) {
    return moment().set('day', number - 1).format('dddd')
  }

  /**
   * CAROUSEL FUNCTIONS
   */

  carouselStep = 0

  moveCarouselRight() {
    let announNum = document.getElementsByClassName('image').length;
    if (this.carouselStep !== announNum - 1) {
      let carouselWidth = (<HTMLDivElement>document.getElementsByClassName('image')[0]).offsetWidth;
      let carouselElement = <HTMLDivElement>document.getElementById('carousel');
      carouselElement.style.left = (+carouselElement.style.left.replace('px', '') - carouselWidth) + "px";
      this.carouselStep += 1;
    }
  }

  moveCarouselLeft() {
    if (this.carouselStep !== 0) {
      let carouselWidth = (<HTMLDivElement>document.getElementsByClassName('image')[0]).offsetWidth;
      let carouselElement = <HTMLDivElement>document.getElementById('carousel');
      carouselElement.style.left = (+carouselElement.style.left.replace('px', '') + carouselWidth) + "px";
      this.carouselStep -= 1;
    }
  }

  /**
   * END OF CAROUSEL FUNCTIONS
   */

  /**
   * ANNOUNCEMENTS FUNCTIONS
   */

  newAnnoun
  showPublish = false;
  newAnnouncementErrors
  from
  to
  publishing
  moment = moment
  hours
  minutes

  initNewAnnou(announcementBody = "", showSchedule = false, fromDay = "", fromHour = "", fromMinute = "", toDay = "", toHour = "", toMinute = "", key?) {
    this.newAnnoun = {
      key,
      announcementBody,
      showSchedule,
      fromDay,
      fromHour,
      fromMinute,
      toDay,
      toHour,
      toMinute,
    }
  }

  toggleAddAnnouncemet() {
    this.showPublish = !this.showPublish
    this.initNewAnnou()
  }

  showEditAnnoun(ann) {
    this.showPublish = true;
  }

  editAnnouncement(ann) {
    this.initNewAnnou(
      ann.message,
      ann.scheduled != null,
      ann.scheduled != null ? moment(+ann.scheduled.from).format('DD MMM YY') : '',
      ann.scheduled != null ? moment(+ann.scheduled.from).hours() + '' : '',
      ann.scheduled != null ? moment(+ann.scheduled.from).minutes() + '' : '',
      ann.scheduled != null ? moment(+ann.scheduled.to).format('DD MMM YY') : '',
      ann.scheduled != null ? moment(+ann.scheduled.to).hours() + '' : '',
      ann.scheduled != null ? moment(+ann.scheduled.to).minutes() + '' : '',
      ann.key
    )
    setTimeout(() => this.showPublish = true, 200)
  }

  deleteAnnoun(ann) {
    this.amenityService.deleteAnnouncement(this.amenity.key, ann.key)
      .then(_ => {
        ann.showDeleteDialog = false
        let annIndex = this.amenity.announcements.findIndex(a => a.key === ann.key)
        this.amenity.announcements.splice(annIndex, 1)
      })
      .catch(() => {
        // ann.showDeleteDialog = false
      })
  }

  publishAnnouncement() {
    this.validateAnnouncementInputs()
    if (this.newAnnouncementErrors) return
    let announcement: any = {
      message: this.newAnnoun.announcementBody,
      startDate: this.from,
      endDate: this.to,
      scheduled: this.newAnnoun.showSchedule
    }
    this.publishing = true
    let action = () => {
      if (this.newAnnoun.key) {
        return this.amenityService.editAnnouncement(this.amenity.key, this.newAnnoun.key, announcement)
      } else {
        return this.amenityService.publishAnnouncement(this.amenity.key, announcement)
      }
    }
    action().then(() => {
      let user = this.redux.getState().user
      announcement.publisherName = user.firstName + " " + user.lastName
      if (!this.amenity.announcements) this.amenity.announcements = []
      if (!this.newAnnoun.key) {
        this.amenity.announcements.push(announcement)
      } else {
        let announcementIndex = this.amenity.announcements.findIndex(ann => ann.key === this.newAnnoun.key)
        announcement.key = this.newAnnoun.key
        this.amenity.announcements.splice(announcementIndex, 1, announcement)
      }
      this.initNewAnnou()
      this.publishing = false
    })
  }

  private validateAnnouncementInputs() {
    this.newAnnouncementErrors = {};
    if (!this.newAnnoun.announcementBody || this.newAnnoun.announcementBody.length == 0) this.newAnnouncementErrors.announcementBody = "Please fill the message"
    if (this.newAnnoun.announcementBody.length > 140) this.newAnnouncementErrors.announcementBody = "The message can't have more then 140 characters"
    if (this.newAnnoun.showSchedule) {
      if (!this.newAnnoun.fromDay || !this.newAnnoun.fromHour || !this.newAnnoun.fromMinute ||
        !this.newAnnoun.toDay || !this.newAnnoun.toHour || !this.newAnnoun.toMinute) this.newAnnouncementErrors.showSchedule = "Please fill all fileds"
      else {
        let from = moment(this.newAnnoun.fromDay, "DD MMM YY").add(this.newAnnoun.fromHour, 'hours').add(this.newAnnoun.fromMinute, 'minutes').valueOf();
        let to = moment(this.newAnnoun.toDay, "DD MMM YY").add(this.newAnnoun.toHour, 'hours').add(this.newAnnoun.toMinute, 'minutes').valueOf();
        if (to - from < 1) this.newAnnouncementErrors.showSchedule = "Time frame isn't valid";
        else {
          this.from = from + "";
          this.to = to + "";
        }
      }
    }
    if (Object.keys(this.newAnnouncementErrors).length === 0) delete this.newAnnouncementErrors;
  }

  getScheduleDate(date) {
    date = parseInt(date);
    return moment(date).format('DD MMM YYYY')
  }

  /**
   * END OF ANNOUNCEMENTS FUNCTIONS
   */

  /**
   * CALENDAR
   */

  months = [];

  currentMonthIndex = 0;

  showDeleteDialog;
  showDeleteRecurrence;

  newEvent: Reservation;
  newEventDay
  newEventErrors

  days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  editIndexs: {
    weekIndex: number,
    day: string,
    eventIndex: number
  }

  loading = true
  loadingReservations = false
  deletingEvent

  newEventTimes
  showNewEvent
  loadingNewEvent = false

  reservationTypes = {
    reservations: "Reservations",
    maintenance: "Maintenance",
    vendors: "Vendors",
    others: "Others"
  }


  newEventSearchFocus = false

  /**
   * TIME DRAGGING
   */

  @ViewChild("timeSelector") timeSelector: ElementRef
  isDragginUp
  isDraggingDown
  timeTopBorder = 0
  timeBottomBorder = 1
  private initNewEventTimes() {
    this.newEventTimes = Array(48).fill(1)
    this.newEventTimes.forEach((t, i) => {
      let time
      if (i === 0) {
        time = "0:00"
      } else {
        let lastTimeHours = parseInt(this.newEventTimes[i - 1].split(':')[0])
        let lastTimeMinutes = parseInt(this.newEventTimes[i - 1].split(':')[1])
        if (lastTimeMinutes === 30) {
          lastTimeHours += 1
          if (lastTimeHours > 12) lastTimeHours -= 12
          time = lastTimeHours + ":" + "00"
        } else {
          time = lastTimeHours + ":" + "30"
        }
      }
      this.newEventTimes.splice(i, 1, time)
    })
  }

  timeLinePressed(index) {
    this.timeSelector.nativeElement.style.top = ((index * 54) + 11) + "px"
    this.timeSelector.nativeElement.style.bottom = (((47 - (index)) * 54) - 9) + "px"
    this.timeTopBorder = index
    this.timeBottomBorder = index + 1
    this.timeSelector.nativeElement.style.display = "block"
  }

  dragginUpMouseDown() {
    if (this.showNewEvent) {
      this.isDragginUp = true;
      document.getElementById("dragUp").style.cursor = "-webkit-grabbing"
      document.addEventListener("mouseup", this.onMouseDragUp.bind(this))
    }
  }

  private onMouseDragUp() {
    if (this.showNewEvent) {
      document.body.style.cursor = "default"
      document.getElementById("dragUp").style.cursor = "-webkit-grab"
      this.isDragginUp = false;
    }
  }

  dragginDownMouseDown() {
    if (this.showNewEvent) {
      this.isDraggingDown = true;
      document.getElementById("dragDown").style.cursor = "-webkit-grabbing"
      document.addEventListener("mouseup", this.onMouseDragDown.bind(this))
    }
  }

  private onMouseDragDown() {
    if (this.showNewEvent) {
      document.body.style.cursor = "default"
      document.getElementById("dragDown").style.cursor = "-webkit-grab"
      this.isDraggingDown = false;
    }
  }

  dragging(event: MouseEvent) {
    if (this.isDragginUp) {
      let divIndex = Array.prototype.findIndex
        .call(
          document.getElementsByClassName("time-entry"),
          (div: HTMLDivElement, index) =>
            this.isMouseInDiv(event.clientX, event.clientY, div, index)
        )
      if (divIndex !== -1 && divIndex < this.timeBottomBorder) {
        this.timeSelector.nativeElement.style.top = ((divIndex * 54) + 11) + "px"
        this.timeTopBorder = divIndex
      }
      this.updateNewEventTime()
    } else if (this.isDraggingDown) {
      let divIndex = Array.prototype.findIndex
        .call(
          document.getElementsByClassName("time-entry"),
          (div: HTMLDivElement, index) =>
            this.isMouseInDiv(event.clientX, event.clientY, div, index)
        )
      if (divIndex !== -1 && divIndex > this.timeTopBorder) {
        this.timeSelector.nativeElement.style.bottom = (((47 - (divIndex)) * 54) - 9) + "px"
        this.timeBottomBorder = divIndex + 1
      }
      this.updateNewEventTime()
    }
  }

  onFullDayClick() {
    this.newEvent.fullDay = !this.newEvent.fullDay
    if (this.newEvent.fullDay) {
      this.timeSelector.nativeElement.style.top = ((0 * 54) + 11) + "px"
      this.timeTopBorder = 0
      this.timeSelector.nativeElement.style.bottom = (((47 - (document.getElementsByClassName("time-entry").length - 1)) * 54) - 9) + "px"
      this.timeBottomBorder = document.getElementsByClassName("time-entry").length
    } else {
      let topDivIndex = 16
      this.timeSelector.nativeElement.style.top = ((topDivIndex * 54) + 11) + "px"
      this.timeTopBorder = topDivIndex
      this.timeSelector.nativeElement.style.bottom = (((47 - (18 - 1)) * 54) - 9) + "px"
      this.timeBottomBorder = 18
      let scrollToElement = <HTMLDivElement>document.getElementsByClassName("time-entry").item(topDivIndex - 3)
      scrollToElement.parentElement.parentElement.scrollTop = scrollToElement.offsetTop
    }
    this.timeSelector.nativeElement.style.display = "block"
    this.updateNewEventTime()
  }

  private updateNewEventTime() {
    let startTime =
      this.newEventTimes[this.timeTopBorder] +
      (this.timeTopBorder >= 24 ? ' PM' : ' AM')

    let endTime =
      this.newEventTimes[this.timeBottomBorder] +
      (this.timeBottomBorder >= 24 ? ' PM' : ' AM')

    let dayFormat = "DD MM YYYY"
    let day = moment(this.newEventDay).format(dayFormat)
    let startDate = moment(day + ' ' + startTime, dayFormat + ' h:mm A')
    let endDate = moment(day + ' ' + endTime, dayFormat + ' h:mm A')
    this.newEvent.startDate = startDate.valueOf().toString()
    this.newEvent.endDate = endDate.valueOf().toString()
  }

  newEventModalClosed() {
    document.removeEventListener("mouseup", this.onMouseDragDown, true)
    document.removeEventListener("mouseup", this.onMouseDragUp, true)
    this.timeSelector.nativeElement.style.display = "none"
    this.showNewEvent = false
    this.initNewEvent()
  }

  private isMouseInDiv(mouseX, mouseY, div: HTMLDivElement, index) {
    let divRect = div.getBoundingClientRect()
    return mouseX < divRect.right && mouseX > divRect.left && mouseY > divRect.top && mouseY < divRect.bottom
  }

  hasHalfAnHour(time) {
    return /30/.test(time)
  }

  availableDailyHours(day: string, events?: Reservation[]): number | "No" {
    let totalEventsTime = 0
    if (events) {
      totalEventsTime = events.reduce((totalTime, event) => {
        let eventDuration = +event.endDate - +event.startDate
        return totalTime + eventDuration
      }, 0)
    }
    if (this.amenity && this.amenity.openingHours) {
      let openingHours = this.getDayOpeningHours(day)
      if (openingHours) {
        let diff =
          moment(`${openingHours.toHour} ${openingHours.toMinute}`, 'H m').valueOf()
          - moment(`${openingHours.fromHour} ${openingHours.fromMinute}`, 'H m').valueOf()
          - totalEventsTime
        let time = Math.floor(diff / 1000 / 60 / 60)
        if (time <= 0) {
          return "No"
        }
        else return time
      }
    }
  }

  getDayOpeningHours(day) {
    if (this.amenity && this.amenity.openingHours) {
      let dayNum = this.fromDayLiteralTonumber(day)
      return this.amenity.openingHours.find(day => day.day === dayNum)
    }
  }

  private fromDayLiteralTonumber(day: string): number {
    switch (day) {
      case "sun": return 1
      case "mon": return 2
      case "tue": return 3
      case "wed": return 4
      case "thu": return 5
      case "fri": return 6
      case "sat": return 7
      default: return 0
    }
  }

  /**
   * END OF TIME DRAGGING
   */

  loadReservations(year, month) {
    this.loadingReservations = true
    this.amenityService.getAmenityReservation(this.amenity.key, year, month)
      .then((data: any) => data.reservations)
      .then((reservations: Reservation[]) => {
        reservations.forEach((reservation, index, reservations) => {
          !reservation.invitees ? reservation.invitees = [] : ''
        })
        this.loadingReservations = false
        if (reservations && Array.isArray(reservations)) {
          this.renderLoadedEvents(reservations)
        } else {
          this.renderLoadedEvents([])
        }
      })
      .catch(_ => this.loadingReservations = false)
  }

  loadCalendar(): any {
    this.loadReservations(moment().year(), moment().month())
  }

  renderLoadedEvents(events) {
    this.initCal();
    events.forEach(e => {
      this.addEventToCal(e);
    })
  }

  private initCal() {
    this.months = [];
    let yearFromNow = moment().add(1, 'year');
    this.renderMonthsUntil(yearFromNow.format('MMMM'), yearFromNow.format('YYYY'));
  }

  changeIndex(amount) {
    if (amount == 1 && this.currentMonthIndex != this.months.length - 1) this.currentMonthIndex++
    else if (amount == -1 && this.currentMonthIndex !== 0) this.currentMonthIndex--;
  }

  hasOverlappingEvents(events: Reservation[]) {
    if (!events || !Array.isArray(events) || events.length === 1) {
      return false
    }
    events = events.sort((prev, current) => {
      if (prev.startDate < current.startDate) {
        return -1
      }
      if (prev.startDate === current.startDate) {
        return 0
      }
      return 1
    })
    for (let i = 1; i < events.length; i++) {
      let previousEnd = +events[i - 1].endDate;
      let currentStart = +events[i].startDate;
      if (previousEnd >= currentStart) {
        return true
      }
    }
    return false
  }

  isOverlappingEvent(event: Reservation, eventIndex: number, events: Reservation[]) {
    if (!events || events.length === 1) {
      return false
    }
    events = events.sort((prev, current) => {
      if (prev.startDate < current.startDate) {
        return -1
      }
      if (prev.startDate === current.startDate) {
        return 0
      }
      return 1
    })
    if(eventIndex !== 0) {
      let previousEnd = +events[eventIndex - 1].endDate;
      let currentStart = +events[eventIndex].startDate;
      if (previousEnd >= currentStart) {
        return true
      }
    }
    if(eventIndex !== events.length - 1) {
      let nextEvent = +events[eventIndex + 1].endDate;
      let currentStart = +events[eventIndex].startDate;
      if (nextEvent >= currentStart) {
        return true
      }
    }
    return false
  }

  addEventToCal(event: Reservation) {
    let date = moment(+event.startDate);
    let month = moment(date).format('MMMM');
    let year = moment(date).format('YYYY');
    let monthIndex = this.months.findIndex(m => m.month == month && m.year == year);
    if (monthIndex == -1) {
      this.renderMonthsUntil(month, year);
      monthIndex = this.months.length - 1;
    }
    this.months[monthIndex].weeks.forEach(week => {
      for (let day in week) {
        if (week[day].date == date.date()) week[day].events.push(event);
      }
    });
  }

  private renderMonthsUntil(month, year) {

    let inputMoment = moment(month + ' ' + year, 'MMMM YYYY');
    let lastRenderedMonth = moment(new Date()).subtract(1, 'month');
    if (this.months.length > 0) {
      lastRenderedMonth = this.months[this.months.length - 1];
      lastRenderedMonth = moment(lastRenderedMonth.month + ' ' + lastRenderedMonth.year, 'MMMM YYYY');
    }

    let diffMonth = inputMoment.diff(lastRenderedMonth, 'months');

    for (let i = 1; i <= diffMonth; i++) {

      let thisMonth = moment(lastRenderedMonth).add(i, 'month')

      let month = {
        year: thisMonth.format('YYYY'),
        month: thisMonth.format('MMMM'),
        weeks: []
      }
      let startOfMonth = moment(thisMonth.startOf('month'));
      let endOfMonth = moment(thisMonth.endOf('month'));
      let week = {};

      for (let i = startOfMonth.date(); i <= endOfMonth.date(); i++) {
        let day = moment(startOfMonth).add(i - 1, 'day');

        if (day.day() == 0) week = {};
        week[day.format('ddd').toLowerCase()] = {
          date: day.date(),
          events: [],
          disabled: day.isBefore(moment().subtract(1, 'day'))
        }

        if (day.day() == 6 || i == endOfMonth.date()) month.weeks.push(week);
      }

      this.months.push(month);

    }
  }

  initNewEvent() {
    this.newEvent = {
      title: "",
      fullDay: false,
      announcement: "",
      startDate: "",
      endDate: "",
      inviteAllComplex: true,
      invitees: [],
      recurrenceType: "once",
      recurrenceUntil: "",
      type: "Reservations",
      blocking: true
    }
  }

  openNewEvent(year, month, day) {
    this.newEventDay = moment(`${year} ${month} ${day}`, 'YYYY MMMM D').valueOf()
    this.showNewEvent = true
  }

  newEventRecurrenceDateChange(date: string) {
    this.newEvent.recurrenceUntil = moment(date, 'DD MMM YY').valueOf() + ""
  }

  toggleTenantInNewReservation(tenant: Tenant) {
    let tenantIndex = this.newEvent.invitees.findIndex(key => key === tenant.key)
    if (tenantIndex > -1) {
      this.newEvent.invitees.splice(tenantIndex, 1)
    } else {
      this.newEvent.invitees.push(tenant.key)
    }
  }

  addBuildingInNewReservation(building) {
    building.tenants.forEach(tenant => {
      let tenantIndex = this.newEvent.invitees.findIndex(k => k === tenant.key)
      if (tenantIndex === -1) this.newEvent.invitees.push(tenant.key)
    })
  }

  isTenantInNewReservation(tenant: Tenant) {
    return this.newEvent.invitees.findIndex(key => key === tenant.key) > -1
  }

  isBuildingInNewReservation(building) {
    for (let tenant of building.tenants) {
      let tenantIndex = this.newEvent.invitees.findIndex(key => key === tenant.key)
      if (tenantIndex === -1) return false
    }
    return true
  }

  publishEvent() {
    if (this.validateNewEvent()) {
      this.toggleLoadingNewEvent()
      let sendToServer = (): Promise<any> => {
        if (this.newEvent.key) {
          return this.amenityService.editReservation(this.newEvent)
        } else {
          return this.amenityService.addAmenityReservation(this.amenity.key, this.newEvent)
        }
      }
      sendToServer()
        .then(data => {
          if (!this.newEvent.key) {
            let event = Object.assign({}, this.newEvent, { key: data.key })
            this.addEventToCal(event)
          } else {
            this.loadCalendar()
          }
          this.initNewEvent()
          this.toggleShowNewEvent()
          this.toggleLoadingNewEvent()
        })
        .catch(err => {
          this.toggleLoadingNewEvent()
        })
    }
  }

  private toggleShowNewEvent() {
    this.showNewEvent = !this.showNewEvent
  }

  private toggleLoadingNewEvent() {
    this.loadingNewEvent = !this.loadingNewEvent
  }

  private validateNewEvent() {
    this.newEventErrors = {}
    if (!this.newEvent.fullDay) {
      if (!this.newEvent.startDate || this.newEvent.startDate.length === 0) {
        this.newEventErrors.startDate = "Please choose event time"
      }
    }
    switch (this.newEvent.type) {
      case "Others":
      case "Maintenance":
      case "Vendors":
        if (!this.newEvent.title || this.newEvent.title.length === 0) {
          this.newEventErrors.title = "Invalid title"
        }
    }

    switch (this.newEvent.type) {
      case "Others":
      case "Reservations":
        if (!this.newEvent.inviteAllComplex) {
          if (this.newEvent.invitees.length === 0) {
            this.newEventErrors.invitees = "Please choose invitees"
          }
        }
    }

    switch (this.newEvent.type) {
      case "Maintenance":
      case "Vendors":
        if (this.newEvent.recurrenceType !== "once") {
          if (!this.newEvent.recurrenceUntil || this.newEvent.recurrenceUntil.length === 0) {
            this.newEventErrors.recurrenceUntil = "Please choose a valid date"
          }
        }
    }

    switch (this.newEvent.type) {
      case "Others":
        if (this.newEvent.announcement.length > 140) {
          this.newEventErrors.announcement = "Can't be more then 140 characters"
        }
    }

    return Object.keys(this.newEventErrors).length === 0
  }

  showDeleteEvent(day) {
    this.showNewEvent = false
    this.showDeleteDialog = true
    this.showNewEvent = false
  }

  deleteEvent() {
    this.deletingEvent = true;
    this.amenityService.deleteReservation(this.newEvent.key)
      .then(() => {
        this.loadCalendar()
        this.deletingEvent = false
        this.showDeleteDialog = false
      })
      .catch(() => {
        this.deletingEvent = false
      })
  }

  deleteRecurentEvent(recurrenceMode) {
    this.deletingEvent = true;
    // this.calendarService.deleteEvent(this.newEvent.key, recurrenceMode)
    //   .then(() => this.calendarService.getComplexEvents(), () => { })
    //   .then((data: any) => {
    //     if (data.items) this.renderLoadedEvents(data.items)
    //     this.showDeleteRecurrence = false;
    //     this.deletingEvent = false
    //     this.initNewEvent()
    //   }, () => {
    //     this.deletingEvent = false
    //   })
  }



  showEditEvent(event) {
    this.newEvent = event
    this.showNewEvent = true
    let eventStartDate = moment(+event.startDate)
    let eventEndDate = moment(+event.endDate)
    this.newEventDay = moment(eventStartDate).startOf("day").valueOf()
    this.timeTopBorder = this.newEventTimes.findIndex(time => time === eventStartDate.format('h:mm'))
    this.timeBottomBorder = this.newEventTimes.findIndex(time => time === eventEndDate.format('h:mm'))
    this.timeSelector.nativeElement.style.top = ((this.timeTopBorder * 54) + 11) + "px"
    this.timeSelector.nativeElement.style.bottom = (((47 - (this.timeBottomBorder)) * 54) - 9) + "px"
    this.timeSelector.nativeElement.style.display = "block"
  }

  getDateDisplayable(date) {
    return moment(date).format('DD MMM YYYY')
  }

  onDocumentClick(event) {
    let element = document.getElementById('newEventTenantDropDown')
    if (element) {
      let clickedOnDropdown = element.contains(event.target)
      let clickedOnSelector = document.getElementById("newEventSearchTenantSelector").contains(event.target)
      if (!clickedOnDropdown && !clickedOnSelector && this.newEventSearchFocus) {
        this.newEventSearchFocus = false
      }
    }
  }

  /**
   * END OF CALENDAR
   */

}

interface Amenity {
  key: string
  activityMode: string
  directions: string
  name: string
  reservable: boolean
  openingHours: {
    day: number
    fromHour: number
    fromMinute: number
    toHour: number
    toMinute: number
  }[]
  imagesUrl: string[]
  rules: string[]
  selectedManagers: {
    fullName: string
    imageUrl: string
    phoneNumber: string
    email: string
  }[]
  timeLimit: number
  timeLimitOption: boolean
  timeLimitUnit: string
  announcements: {
    key: string
    message: string
    publishDate: string
    scheduled: {
      from: string,
      to: string
    }
    publisherName: string
  }[]
}

export interface Reservation {
  key?: string
  title: string
  fullDay: boolean
  startDate: string
  endDate: string
  type: "Reservations" | "Maintenance" | "Vendors" | "Others"
  recurrenceType: "once" | "weekly" | "monthly" | "yearly"
  recurrenceUntil: string
  blocking: boolean
  announcement?: string
  invitees: string[]
  inviteAllComplex: boolean
}

