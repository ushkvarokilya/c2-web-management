import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as Moment from 'moment';

import { AppState } from '../../store/appState';
import { User } from '../../store/user/user.interface';
import { Company } from '../../store/company/company.interface';
import { ComplexService } from '../../services/complex.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { MessagingService } from '../../services/messaging.service';
import { VendorService } from "../../services/vendor.service";

import { environment } from "../../../environments/environment";
import { DatePipe } from '@angular/common';
import { tick } from '@angular/core/testing';



@Component({
  selector: 'app200-maintenance-page',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})

export class MaintenancePageComponent implements OnInit {

  @select() user$: Observable<User>
  @select() company$: Observable<Company>

  expandPayment = false
  searchQuery
  clickedTicketEditOffers
  tickets = []
  rating = 2
  nonHoverRating = 2
  isHoverMode = false
  tempRating
  clickedTicket
  canMerge = false

  toBeRated = []
  currentlyRating

  showBy = "All"

  sortBy = 'apartementName'
  ratingLoading = false
  statuses = {
    In_Progress: "In Progress",
    New: "New",
    Done: "Done",
    Vendor: "Vendor"
  }

  inProgressNum = 0
  newNum = 0
  vendorNum = 0
  ratingTicketModalOpened = false

  hours
  minutes
  datepicker
  sendingToVendors
  vendors = []

  vendorOffers = []

  chooseVendor

  chooseVendorErrors

  addPhotoKey

  personWhoFix = 'Janitor';

  show = "Location Manager"
  // show = "Janitor"

  mainMessage

  dataLoaded

  constructor(private redux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private complexService: ComplexService,
    private maintenanceService: MaintenanceService,
    private messagesService: MessagingService,
    private vendorService: VendorService) {

    this.hours = []
    for (let i = 1; i <= 23; i++) this.hours.push(i)
    this.minutes = []
    for (let i = 0; i <= 59; i++) this.minutes.push(i)

  }

  ngOnInit() {
    if (this.redux.getState().user.isJanitor) {
      this.show = "Janitor"
    }
    this.user$.subscribe(user => {
      if (user.isJanitor) {
        this.show = "Janitor"
      } else {
        this.show = "Location Manager"
      }
    })

    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && !this.dataLoaded) {
        this.loadTickets()
        this.dataLoaded = true
      }
    })
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.searchQuery) this.searchQuery = params.searchQuery
    })
    this.initChooseVendor()
  }

  moment(date = Date.now()) {
    return Moment(+date)
  }

  addImageToTicket(ticket, imageUrl) {
    if (!ticket.photosUrl) {
      ticket.photosUrl = []
    }
    ticket.photosUrl.push(imageUrl)
    ticket.currentPhoto = imageUrl
    this.maintenanceService.updateMaintenanceTicket(ticket.key, { photoUrl: imageUrl })
      .then(() => { })
  }

  loadTickets() {
    this.mainMessage = "Loading..."
    this.maintenanceService.getManagementMaintananceTickets()
      .then((data: any) => {
        if (data && data.items && data.items.length > 0) {
          this.tickets = data.items.map(ticket => {
            ticket.estimatedWorkTime = +ticket.estimatedWorkTime
            ticket.closedTime = +ticket.closedTime
            ticket.dateCreated = +ticket.dateCreated
            if (ticket.photosUrl && ticket.photosUrl.length > 0) {
              ticket.currentPhoto = ticket.photosUrl[0];
            }
            ticket.showDetails = false;
            ticket.selected = false;
            if (ticket.problemDescription.startsWith("Other:"))
              ticket.moreInfo.unshift({ body: ticket.problemDescription.replace('Other:', ''), name: 'Full desctiption' })
            return ticket;
          });
          this.tickets.sort((a, b) => {
            if (a.status === "New" && b.status !== "New") return -1
            if (a.status !== "New" && b.status === "New") return 1
            else return 0
          })
          delete this.mainMessage;
          this.countTicketsStatus();
          if (this.show !== "Janitor") this.rateUnrated();
        } else {
          this.mainMessage = "No Tickets"
        }
      }, err => {

      })
  }

  rateUnrated() {
    for (let ticket of this.tickets) {
      if (ticket.status === "Done" && ticket.ratingRequired) this.toBeRated.push(ticket);
    }
    if (this.toBeRated.length > 0) {
      this.currentlyRating = this.toBeRated[0]
    }
  }

  openAddPhoto(key) {
    this.addPhotoKey = key;
    (<HTMLInputElement>document.getElementsByClassName('cloudinary_fileupload')[0]).click();
  }

  addMoreInfo(event: Event, ticketKey) {
    let ticket = this.tickets.find(t => t.key == ticketKey);
    let target = <HTMLTextAreaElement>event.target;
    let text = target.value.trim();
    target.value = "";

    let doneTicketInfo = ticket.moreInfo.filter(info => info.body == 'TICKET-DONE');

    ticket.moreInfo.push({ body: text, name: this.redux.getState().user.position })
    let newMoreInfo = ticket.moreInfo[ticket.moreInfo.length - 1]
    this.maintenanceService.updateMaintenanceTicket(ticket.key, { moreInfo: newMoreInfo })
      .then(() => {
        if (doneTicketInfo.length > 0) {
          ticket.moreInfo.push({ body: "TICKET-DONE", name: doneTicketInfo[0].name })
          this.maintenanceService.updateMaintenanceTicket(ticket.key, { moreInfo: doneTicketInfo[0] })
            .then(() => { })
        }
      })

  }

  vendorRequired(ticket) {
    ticket.status = "Vendor"
    this.maintenanceService.updateMaintenanceTicket(ticket.key, { status: "Vendor" })
      .then(_ => { })
  }

  private initChooseVendor() {
    this.chooseVendor = {
      timeType: "ASAP",
      fromDay: null,
      fromHour: null,
      fromMinute: null,
      toDay: null,
      toHour: null,
      toMinute: null,
      choosenVendors: [],
      offerDeadlineDay: null,
      offerDeadlineHour: null,
      offerDeadlineMinute: null,
      timeRangeError: null
    }
  }

  checkTimeRange() {
    this.chooseVendor.timeRangeError = null;
    if (this.chooseVendor.fromDay && this.chooseVendor.fromHour && this.chooseVendor.fromMinute &&
      this.chooseVendor.toDay && this.chooseVendor.toHour && this.chooseVendor.toMinute) {
      let timeRange = (Moment(new Date(this.chooseVendor.toDay)).add('hours', this.chooseVendor.toHour).add('minute', this.chooseVendor.toMinute).unix() -
        Moment(new Date(this.chooseVendor.fromDay)).add('hours', this.chooseVendor.fromHour).add('minutes', this.chooseVendor.fromMinute).unix());
      if (timeRange < 0) {
        this.chooseVendor.timeRangeError = "Time range can't be negative";
      } else if (timeRange < (8640000 * 3)) {
        this.chooseVendor.timeRangeError = "Notice: The time frame you entered is larger than 3 days";
      }
    }

  }

  modalVisibiltyChanged(event) {
    if (!event) {
      setTimeout(() => delete this.clickedTicket, 500);
      this.initChooseVendor()
      this.sendingToVendors = false;
    }
  }

  countTicketsStatus() {
    this.inProgressNum = 0;
    this.newNum = 0;
    this.vendorNum = 0;
    this.tickets.forEach(ticket => {
      switch (ticket.status) {
        case "New":
          this.newNum++;
          break;
        case "In_Progress":
          this.inProgressNum++;
          break;
        case "Vendor":
          this.vendorNum++;
          break;
      }
    });
  }

  countSelectedTickets() {
    setTimeout(() => {
      let i = 0;
      this.tickets.forEach(ticket => {
        if (ticket.selected) i++
      });
      this.canMerge = i > 1;
    })
  }

  showSetTimeDialog(ticket) {
    this.clickedTicket = ticket;
    this.clickedTicket.date = "today";
  }

  showGetVendorDialog(ticket) {
    this.clickedTicket = ticket;
    this.vendors = [];
    this['loadingVendors'] = true;
    this.vendorService.getVendors()
      .then((data: any) => {
        this['loadingVendors'] = false;
        if (data.vendors) {
          data.vendors.forEach((vendor: any) => {
            let profession = this.vendors.find(val => vendor.professions && vendor.professions.includes(val.type))
            if (profession) profession.vendors.push(vendor)
            else {
              vendor.professions.forEach(prof => {
                this.vendors.push({
                  type: prof,
                  vendors: [vendor]
                })
              })
            }
          });
        }
      }, _ => this['loadingVendors'] = false);
  }

  setEstTime() {
    let date;
    if (this.clickedTicket.date == 'today') {
      date = Moment();
    } else if (this.clickedTicket.date == 'tomorrow') {
      date = Moment().add(1, 'days');
    } else if (this.clickedTicket.date == 'monday') {
      date = Moment().add(2, 'days')
    } else {
      date = Moment(this.datepicker, 'DD MMM YY');
    }
    date.minute((<HTMLSelectElement>document.getElementById('selectEstMinute')).value);
    date.hour((<HTMLSelectElement>document.getElementById('selectEstHour')).value);
    this.maintenanceService.updateMaintenanceTicket(this.clickedTicket.key, { estimateDate: date.valueOf(), status: "In_Progress" })
      .then(() => {
        this.clickedTicket.estimatedWorkTime = date.valueOf();
        this.clickedTicket.error = undefined;
        this.clickedTicket.status = "In_Progress"
        delete this.clickedTicket;
      }, () => {
        this.clickedTicket.error = "Error updating ticket";
      })
  }

  mergeTickets() {
    let selected = [];
    for (let ticket of this.tickets) {
      if (ticket.selected) {
        selected.push(ticket);
        ticket.selected = false;
      }
    }
    let dominant = selected.splice(0, 1)[0];
    this.maintenanceService.mergeTickets(dominant.key, selected.map(t => t.key))
      .then(() => {
        dominant.merged = true;
        dominant.apartments = dominant.apartments.concat(selected.map(t => t.apartments.reduce((a, b) => a.concat(b))))
        this.tickets.forEach((ticket, index) => {
          if (ticket.key == dominant.key) {
            this.tickets[index] = dominant;
          }
          selected.forEach(selectedTicket => {
            if (selectedTicket.key == ticket.key) {
              this.tickets.splice(index, 1);
            }
          })
        });
        this.countSelectedTickets();
      }, (err) => {

      })
  }

  seperateTickets(ticketKey) {
    this.maintenanceService.seperateTicket(ticketKey)
      .then((data: any) => {
        let ticketIndex = this.tickets.findIndex(t => t.key == ticketKey);
        this.tickets.splice(ticketIndex, 1);
        this.tickets.concat(data.items);
      }, err => {

      })
  }

  navigateToChatWithTenant(tenant, apartment) {
    let participant = {
      key: tenant.key,
      name: tenant.firstName + ' ' + tenant.lastName,
      imageUrl: tenant.imageUrl,
      apartment
    }
    this.messagesService.setCurrentGroupByParticipant(participant);
    this.router.navigate(['/messaging'])
  }

  removeVendor(choosenVendorIndex) {
    let vendor = this.chooseVendor.choosenVendors.splice(choosenVendorIndex, 1)[0];
    for (let i = 0; i < this.vendors.length; i++) {
      for (let j = 0; j < this.vendors[i].vendors.length; j++) {
        if (vendor.key == this.vendors[i].vendors[j].key) {
          (<any>this.vendors[i].vendors[j]).checked = false;
          (<any>this.vendors[i]).checked = false;
        }
      }
    }
  }

  checkGroup(group) {
    group.checked = !group.checked;
    if (group.checked) {
      group.vendors.forEach(v => {
        v.checked = true
        if (this.getVendorInChossenindex(v) == -1) {
          this.chooseVendor.choosenVendors.push(v);
        }
      })
    }
  }

  checkVendor(vendor, group) {
    vendor.checked = !vendor.checked;
    if (vendor.checked) {
      let allChecked = true;
      for (let i = 0; i < group.vendors.length && allChecked; i++) {
        allChecked = allChecked && group.vendors[i].checked;
      }
      group.checked = allChecked;
      if (this.getVendorInChossenindex(vendor) == -1) this.chooseVendor.choosenVendors.push(vendor);
    } else {
      group.checked = false;
      this.chooseVendor.choosenVendors.splice(this.getVendorInChossenindex(vendor), 1);
    }
  }

  private getVendorInChossenindex(vendor): any {
    for (let i = 0; i < this.chooseVendor.choosenVendors.length; i++) {
      if (vendor.key == this.chooseVendor.choosenVendors[i].key) return i;
    }
    return -1;
  }

  sendToVendors() {
    this.checkInputs();
    if (this.chooseVendorErrors) return;
    this.sendingToVendors = true;
    let arrayOfVendorkeys = [];
    for (let vendorCategory of this.vendors) {
      for (let vendor of vendorCategory.vendors) {
        if (vendor.checked && !arrayOfVendorkeys.includes(vendor.key)) {
          arrayOfVendorkeys.push(vendor.key);
        }
      }
    }
    let fromDate = this.chooseVendor.fromDay && this.chooseVendor.fromHour && this.chooseVendor.fromMinute ? this.returnMomentString(this.chooseVendor.fromDay, this.chooseVendor.fromHour, this.chooseVendor.fromMinute) : undefined;
    this.maintenanceService.sendToVendor(this.clickedTicket.key, this.redux.getState().user.key,
      arrayOfVendorkeys,
      this.chooseVendor.fromDay && this.chooseVendor.fromHour && this.chooseVendor.fromMinute
        ? this.returnMomentString(this.chooseVendor.fromDay, this.chooseVendor.fromHour, this.chooseVendor.fromMinute) : undefined,
      this.chooseVendor.toDay && this.chooseVendor.toHour && this.chooseVendor.toMinute
        ? this.returnMomentString(this.chooseVendor.toDay, this.chooseVendor.toHour, this.chooseVendor.toMinute) : undefined,
      this.chooseVendor.offerDeadlineDay && this.chooseVendor.offerDeadlineHour && this.chooseVendor.offerDeadlineMinute
        ? this.returnMomentString(this.chooseVendor.offerDeadlineDay, this.chooseVendor.offerDeadlineHour, this.chooseVendor.offerDeadlineMinute) : undefined
    ).then((data) => {
      this.sendingToVendors = false;
      this.clickedTicket.offerResponses = 0
      this.initChooseVendor();
      this.clickedTicket = undefined;
    }, _ => { });
  }

  returnMomentString(toParseStringDate, toParseStringHour, toParseStringMinute): string {
    return Moment(toParseStringDate, 'DD MMM YY')
      .add(toParseStringHour, 'hour')
      .add(toParseStringMinute, 'minute')
      .valueOf().toString();
  }

  private checkInputs() {
    this.chooseVendorErrors = {};
    if (this.chooseVendor.timeType == "TIMEFRAME") {
      if (!this.chooseVendor.fromDay || !this.chooseVendor.fromHour || !this.chooseVendor.fromDay ||
        !this.chooseVendor.toDay || !this.chooseVendor.toHour || !this.chooseVendor.toMinute) {
        this.chooseVendorErrors.dates = "Please fill the dates";
      }
    }
    if (this.chooseVendor.choosenVendors.length == 0) this.chooseVendorErrors.choosenVendors = "Please choose at least one vendor";
    if (!this.chooseVendor.offerDeadlineDay || !this.chooseVendor.offerDeadlineHour || !this.chooseVendor.offerDeadlineMinute)
      this.chooseVendorErrors.deadline = "Please fill the date"

    if (Object.keys(this.chooseVendorErrors).length === 0) delete this.chooseVendorErrors
  }

  sendReminderToJanitor(ticket) {
    this["sendingReminder"] = true
    this.maintenanceService.sendReminderToJanitor(ticket.key)
      .then(() => {
        this["sendingReminder"] = false;
      }, () => {
        this["sendingReminder"] = false;
      })
  }

  clearDateChoices() {
  }

  showVendorOffersResponses(ticketKey) {
    this.clickedTicketEditOffers = true
    this.maintenanceService.getVendorOfferResponse(ticketKey)
      .then((data: any) => {
        this.vendorOffers = data.items
      }, _ => { })
  }

  assignVendor(offerKey, ticketKey) {
    let ticket = this.tickets.find(t => t.key === ticketKey)
    this.maintenanceService.assignVendor(offerKey)
      .then(() => {
        this.clickedTicketEditOffers = false
        ticket.status = "In_Progress"
      }, _ => {
        this.clickedTicketEditOffers = false
        ticket.status = "In_Progress"
      })
  }

  getArray(number) {
    let arr = [];
    for (let i = 0; i < number; i++) arr.push(i);
    return arr;
  }

  changeRating(index) {
    this.isHoverMode = true;
    if (index > 5) {
      index = 5;
    }
    if (index > this.rating || index < (this.rating - 1)) {
      this.tempRating = this.rating;
      this.rating = index;
    }
  }

  changeRatingLeave() {
    this.isHoverMode = false;
  }

  clickChangeRating(goldIndex) {
    // this.nonHoverRating = goldIndex + 1;
    this.toBeRated[0].vendor.rating = goldIndex + 1;
  }

  toggleHover() {
    this.isHoverMode = true;
  }

  toggleLeave() {
    this.isHoverMode = false;
  }

  rateVendor() {
    this.ratingLoading = true
    this.maintenanceService.rateTicket(this.currentlyRating.key, this.currentlyRating.vendor.rating)
      .then((data) => {
        delete this.currentlyRating
        this.toBeRated.splice(0, 1)
        this.currentlyRating = this.toBeRated[0]
        this.ratingLoading = false
      })
  }

  isPast(time) {
    return Date.now() > +time
  }

  clickMarkAsFix(ticket) {

    this.maintenanceService.sendFixProblemResolve(ticket.key, { lastStatusChanged: this.moment(), status: "Done" })
      .then(() => {
        ticket.status = this.statuses.Done;
        ticket.lastStatusChanged = this.moment().valueOf();

        ticket.moreInfo.push({ body: "TICKET-DONE", name: this.redux.getState().user.position })
        let newMoreInfo = ticket.moreInfo[ticket.moreInfo.length - 1]
        this.maintenanceService.updateMaintenanceTicket(ticket.key, { moreInfo: newMoreInfo })
          .then(() => { })
      })
  }


  translateTrueOrFalse(isTrue) {
    if (isTrue == 'unknown') return 'Unknown';
    else if (isTrue) return 'Yes';
    else if (!isTrue) return 'No';
    else return "";
  }
}