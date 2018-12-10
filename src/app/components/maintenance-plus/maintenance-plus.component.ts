import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as Moment from 'moment';

import { AppState } from '../../store/appState';
import { User } from '../../store/user/user.interface';
import { Company } from '../../store/company/company.interface';
import { CompanyService } from '../../services/company.service';
import { ComplexService } from '../../services/complex.service';
import { MaintenanceService } from '../../services/maintenance.service';
import { MessagingService } from '../../services/messaging.service';
import { VendorService } from "../../services/vendor.service";

import { environment } from "../../../environments/environment";
import { DatePipe } from '@angular/common';
import { tick } from '@angular/core/testing';
import { Http, Response, Headers } from '@angular/http';
import { ignoreElements } from 'rxjs/operator/ignoreElements';
import { filter, takeWhile, concatAll } from 'rxjs/operators';

import { Lightbox } from 'angular2-lightbox';
@Component({
  selector: 'app-maintenance-plus',
  templateUrl: './maintenance-plus.component.html',
  styleUrls: ['./maintenance-plus.component.scss'],
  host: {
		'(document:click)': 'onDocumentClick($event)',
	}
})
export class MaintenancePlusComponent implements OnInit {

  @select() user$: Observable<User>
  @select() company$: Observable<Company>

  expandPayment = false
  searchQuery
  clickedTicketEditOffers
  tickets = []
  rating = 1
  nonHoverRating = 1
  isHoverMode = false
  tempRating
  clickedTicket
  canMerge = false

  toBeRated = []
  currentlyRating
  showBy = "All"

  sortBy = 'TicketDate$'
  ratingLoading = false
  statuses = {
    Open: "Open",
    Vendor_Required: "Vendor Required",
    Auction_Created: "Auction Created",
    Vendor_Assigned: "Vendor Assigned",
    Vendor_Resolved: "Vendor Resolved",
    Vendor_In_Progress: "Vendor In Progress",
    In_Progress: "In Progress",
    Assigned: "Assigned",
    Resolved: "Resolved",
    New: "New",
    Done: "Done",
    Vendor: "Vendor"
  }

  OpenNum = 0
  InProgressNum = 0
  ResolvedNum = 0
  DoneNum = 0
  VendorRequiredNum = 0
  AuctionCreatedNum = 0
  VendorAssignedNum = 0
  VendorInProgressNum = 0
  VendorResolvedNum = 0

  ratingTicketModalOpened = false

  hours
  minutes
  datepicker
  sendingToVendors
  vendors = []

  vendorOffers = []
  vendorOffersTicket

  chooseVendor

  chooseVendorErrors

  addPhotoKey

  personWhoFix = 'Janitor';

  show = "Location Manager"
  // show = "Janitor"

  mainMessage

  dataLoaded

  complexKey

  email
  displayName
  position
  key

  vendorServer = environment.vendor_api_endpoint;

  showEditInfo = false;

  mainCategory
  subCategory

  categories
  ticketCategory

  imgGallery
  imgGallerycurrentPhoto
  imgGalleryTicket
  imgGalleryArray
  imgGalleryPdf
  imgGalleryVideo

  timeToAssign
  otherCategory = null;
  rateShow = false;
  fixedShow = false;
  ResolvedDoneShow = false;
  rateTicket;
  rateOffer;

  facilities;
  users;
  jusers;

  uploadProgresspercentage = 0;
  private _albums = [];
  constructor(private redux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private complexService: ComplexService,
    private maintenanceService: MaintenanceService,
    private messagesService: MessagingService,
    private vendorService: VendorService,
    private http: Http,
    private _lightbox: Lightbox
  ) {

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
      this.email = user.email;
      this.position = user.position;
      this.displayName = user.firstName + ' ' + user.lastName;
      this.key = user.key;
      if (user.isJanitor) {
        this.show = "Janitor"
      } else {
        this.show = "Location Manager"
      }
    })
 
    let dataFromServerFetched = false;
    let keys = [];
    this.user$
    .pipe(
      filter(user => user.token !== null),
      takeWhile(_ => !dataFromServerFetched)
    )
    .subscribe(user => {
      dataFromServerFetched = true
      this.companyService.getComplexesDetailed(user.companyKey)
        .then((data: any) => {this.facilities = data.facilities;
          let facility = data.facilities.find(f => f.key === localStorage.getItem('currentComplexKey'));
          keys = facility.janitorKeys;
          })
          setTimeout(()=>{ 
            this.companyService.getCompanyUsers(user.companyKey)
            .then((data: any) => {
              this.users = data.users;
              this.jusers =  data.users.filter(u =>keys.includes(u.key));
            })
          }, 2000)

    })

    // this.company$.subscribe((company: Company) => {
    //   if (company.currentComplex !== null && !this.dataLoaded) {
    //     this.complexKey = company.currentComplex.key
    //     //this.loadTickets()
    //     this.dataLoaded = true
    //   }
    // })
   
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.searchQuery) this.searchQuery = params.searchQuery
    })

    this.initChooseVendor()

    //this.connectToVendors();
    this.GetTicketsFromVendors();
  }

  ngAfterContentInit() {
    this.LoadCategories();
  }

  selectJanitor(user,ticket){
    ticket.selectedJanitor = user;
    return true;  
  }

  LoadCategories() {
    var headers = new Headers();
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.get(this.vendorServer + 'api/Categories', { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        this.categories = t.categorieslist;
      });
  }

  LoadCategoriesdialog(ticket) {
    this.showEditInfo = true;
    this.ticketCategory = ticket;
    this.mainCategory = this.categories.find(t => t.proname === ticket.TicketTitle);
    this.subCategory = ticket.TicketSubTitle;
  }

  updateTitleAndSubtitle(ticket, category, sub) {
    ticket.TicketTitle = category;
    ticket.TicketSubTitle = sub;
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        TicketStatus: ticket.status,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position,
        mainCategory: category,
        subCategory: sub
      });
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/Categories', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    this.showEditInfo = false;
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Title and subtitle was updated";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  GetTicketsFromVendors() {
    this.mainMessage = "Loading..."
    var headers = new Headers();
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.get(this.vendorServer + 'api/ManagerTickets/' + localStorage.getItem('currentComplexKey'), { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        if (t && t.tickets && t.tickets.length > 0) {
          this.tickets = t.tickets.map(ticket => {
            ticket.estimatedWorkTime = +ticket.estimatedWorkTime
            ticket.closedTime = +ticket.closedTime
            ticket.dateCreated = +ticket.dateCreated
            ticket.mainImg = [];
            if (ticket.files) {
              if (ticket.files.tenantGallery.length > 0) {
                ticket.currentPhoto = ticket.files.tenantGallery[0].imageurl;
                ticket.mainImg.push({ id: 1, description: ticket.files.tenantGallery[0].uploaderType + " : " + ticket.files.tenantGallery[0].uploaderName, url: ticket.currentPhoto, size: ticket.files.tenantGallery.length - 1 });
              }
              if (ticket.files.managementGallery.length > 0) {
                ticket.currentPhoto = ticket.files.managementGallery[0].imageurl;
                ticket.mainImg.push({ id: 2, description: ticket.files.managementGallery[0].uploaderType + " : " + ticket.files.managementGallery[0].uploaderName, url: ticket.currentPhoto, size: ticket.files.managementGallery.length - 1 });
              }
              if (ticket.files.vendorGallery.length > 0) {
                ticket.currentPhoto = ticket.files.vendorGallery[0].imageurl;
                ticket.mainImg.push({ id: 3, description: ticket.files.vendorGallery[0].uploaderType + " : " + ticket.files.vendorGallery[0].uploaderName, url: ticket.currentPhoto, size: ticket.files.vendorGallery.length - 1 });
              }
            }
            
            ticket.ticketNumber = ticket.TicketId.substring(2);
            ticket.showDetails = false;
            ticket.selected = false;

            if (ticket.TicketStatus !== null) {
              ticket.status = ticket.TicketStatus.replace(' ', '_').replace(' ', '_');
            }
            if (ticket.TicketStatus === 'Tenant Done') {
              ticket.status = 'Done';
            }
            if (ticket.statusHistory && ticket.statusHistory.length > 0) {
              ticket.lastUpdateDate = ticket.statusHistory[0].LogDate;
              ticket.lastUpdateTitle = ticket.statusHistory[0].LogTitle;
              ticket.lastUpdateFullname = ticket.statusHistory[0].LogFullname;
              ticket.lastUpdateEmail = ticket.statusHistory[0].LogEmail;
              ticket.lastUpdatePosition = ticket.statusHistory[0].LogPosition;

              ticket.createdDate = ticket.statusHistory[ticket.statusHistory.length -1].LogDate;
              ticket.createdFullname = ticket.statusHistory[ticket.statusHistory.length -1].LogFullname;
              ticket.createdEmail = ticket.statusHistory[ticket.statusHistory.length-1].LogEmail;
              ticket.createdPosition = ticket.statusHistory[ticket.statusHistory.length-1].LogPosition;
            }
            if(ticket.createdDate == null){
              ticket.createdDate = ticket.TicketDate;
              ticket.createdFullname = ticket.tenantFullName;
              ticket.createdEmail = ticket.TicketType;
              ticket.createdPosition = "Tenant";
            }
            ticket.problemArea = ticket.problemArea.replace(' ', '');
            if (ticket.offers_list.length > 0) {
              ticket.offers_list.forEach(element => {
                if (element.OfferStatus === 'Win' || element.OfferStatus === 'Done' ||  element.OfferStatus === "In Progress") {
                  ticket.vendorAssignedName = element.companyName;
                  ticket.vendorAssignedDate = element.ArrivalDate;
                }
              });
            }

            ticket.moreInfo = [{name: ticket.tenantFullName,body: ticket.TicketDecription}];
            ticket.closeAttachments = [];
            ticket.closeInfo = [];
            ticket.selectedJanitor = null;
            ticket.TicketSubTitle = ticket.TicketSubTitle.substring(0, 50)
            this.dataLoaded = true
            return ticket;
          });
          this.tickets.sort((a, b) => {
            if (a.status === "New" && b.status !== "New") return -1
            if (a.status !== "New" && b.status === "New") return 1
            else return 0
          })
          delete this.mainMessage;
          this.countTicketsStatus();
        } else {
          this.mainMessage = "No Tickets"
        }
      });
  }
  connectToVendors() {

    // this.http.get('http://35.238.181.68/api/Temp/2101/tenants').subscribe(
    //   (res: Response) =>{ const t = res.json();
    //  console.log(t)} );

    let user_details = JSON.parse(localStorage.getItem('user_details'))
    var headers = new Headers();
    var json = JSON.stringify({ AppCustomerName: '', AppCustomerEmail: user_details.email, AppCustomerAuth: localStorage.getItem('currentComplexKey') });
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/AppCustomers', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
  }

  moment(date = Date.now()) {
    return Moment(+date)
  }

  addImageToTicket(ticket, imageUrl) {
    console.log(imageUrl);
    console.log(imageUrl.name);
    console.log(imageUrl.url);
    let item = ticket.mainImg.filter(item => item.id === 2)
    let itemSize = item == null ? 0 : item.size;
    ticket.mainImg = ticket.mainImg.filter(item => item.id !== 2)
    ticket.mainImg.push({ id: 2, description: "Manager : " + this.displayName, url: imageUrl.url , size: itemSize  + 1 });
    ticket.currentPhoto = imageUrl.url;

    ticket.closeAttachments.push({id: ticket.closeAttachments.length + 1, url: imageUrl.url , name: "Manager : " + this.displayName , fileName: imageUrl.name.split(".")[0], fileEnd:imageUrl.name.split(".")[1], rename: imageUrl.name.split(".")[0], edit:false });

    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        imageurl: imageUrl.url,
        ticketid: ticket.TicketId,
        uploaderType: "Manager",
        uploaderName: this.displayName,
        uploaderFullName: this.displayName,
        imageDescription: "",
        uploaderEmail: this.email,
        uploaderPosition: this.position
      });
      console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/FilesManager/UploadFile', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
      ticket.lastUpdateDate = this.moment().valueOf();
      ticket.lastUpdateTitle = "Image was added";
      ticket.lastUpdateFullname = this.displayName;
      ticket.lastUpdateEmail = this.email;
      ticket.lastUpdatePosition = this.position;
    // this.maintenanceService.updateMaintenanceTicket(ticket.key, { photoUrl: imageUrl })
    //   .then(() => { })
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
    let ticket = this.tickets.find(t => t._id == ticketKey);
    let target = <HTMLTextAreaElement>event.target;
    let text = target.value.trim();
    target.value = "";

    let doneTicketInfo = ticket.moreInfo.filter(info => info.body == 'TICKET-DONE');

    ticket.moreInfo.push({ body: text, name: this.redux.getState().user.firstName +" "+this.redux.getState().user.lastName })
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
    // this.maintenanceService.updateMaintenanceTicket(ticket.key, { status: "Vendor" })
    //   .then(_ => { })
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        TicketStatus: this.statuses.Vendor_Required,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    //api/ManagerTickets
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/UpdateTicketStatus', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
      ticket.status = "Vendor_Required";
      ticket.lastUpdateDate = this.moment().valueOf();
      ticket.lastUpdateTitle = "Ticket status was updated";
      ticket.lastUpdateFullname = this.displayName;
      ticket.lastUpdateEmail = this.email;
      ticket.lastUpdatePosition = this.position;
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
    this.OpenNum = 0
    this.InProgressNum = 0
    this.ResolvedNum = 0
    this.DoneNum = 0
    this.VendorRequiredNum = 0
    this.AuctionCreatedNum = 0
    this.VendorAssignedNum = 0
    this.VendorInProgressNum = 0
    this.VendorResolvedNum = 0
    this.tickets.forEach(ticket => {
      switch (ticket.status) {
        case "Open":
          this.OpenNum++;
          break;
        case "In_Progress":
          this.InProgressNum++;
          break;
        case "Resolved":
          this.ResolvedNum++;
          break;
        case "Done":
          this.DoneNum++;
          break;
        case "Resolved":
          this.ResolvedNum++;
          break;
        case "Vendor_Required":
          this.VendorRequiredNum++;
          break;
        case "Auction_Created":
          this.AuctionCreatedNum++;
          break;
        case "Vendor_Assigned":
          this.VendorAssignedNum++;
          break;
        case "Vendor_Resolved":
          this.VendorResolvedNum++;
          break;
        case "Vendor_In_Progress":
          this.VendorInProgressNum++;
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
    this.LoadCategories();
    this.showGallery(ticket, 0);
    // this.vendorService.getVendors()
    //   .then((data: any) => {
    //     this['loadingVendors'] = false;
    //     if (data.vendors) {
    //       data.vendors.forEach((vendor: any) => {
    //         let profession = this.vendors.find(val => vendor.professions && vendor.professions.includes(val.type))
    //         if (profession) profession.vendors.push(vendor)
    //         else {
    //           vendor.professions.forEach(prof => {
    //             this.vendors.push({
    //               type: prof,
    //               vendors: [vendor]
    //             })
    //           })
    //         }
    //       });
    //     }
    //   }, _ => this['loadingVendors'] = false);
    let i = 0;
    let checkedSubCategory = null;
    let checkedCategory = null;
    let flag = false;
    this.categories.forEach(element => {
      let vendor = [];
      element.subs.forEach(vendors => {
         vendor.push({ key: ++i, firstName: vendors.name, checked: false});
         if(vendors.name === ticket.TicketSubTitle){
          flag = true;
          checkedSubCategory = { key: i, firstName: vendors.name, checked: false};
        }
      });
      this.vendors.push({ type: element.proname, vendors: vendor, checked: false});
      if(flag) checkedCategory = { type: element.proname, vendors: vendor, checked: false};
    });
    //(vendor, group)
    this.checkVendor(checkedSubCategory,checkedCategory);
    this['loadingVendors'] = false;
  }

  sendVendorAuction(ticket) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        TicketStatus: this.statuses.Auction_Created,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    //api/ManagerTickets
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/UpdateTicketStatus', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    this.clickedTicket = null;
    ticket.status = 'Auction_Created';
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Ticket status was updated";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  cancelAuction(ticket) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/CancelAuctionRequest', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    this.clickedTicket = null;
    ticket.status = 'In_Progress';
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Auction canceled";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }
  
  cancelVendorAssignment(ticket,offer) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        OfferId: offer.offerId,
        AppCustomerAuth: ticket.FacilityId,
        TicketAuth:ticket._id,
        TicketId: ticket.TicketId,
        ResponseId: offer.ResponseId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );

    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/CancelVendorAssignment', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    this.clickedTicket = null;
    ticket.status = 'Auction_Created';
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "offer canceled";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
    ticket.vendorAssignedName = undefined;
    ticket.vendorAssignedDate = undefined;
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
    if(vendor.firstName === 'Other' && vendor.checked == false){
      this.otherCategory = group.type +" , " + vendor.firstName + " -";
    }else{
      this.otherCategory = null;
    }
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

  showVendorOffersResponses(ticket) {
    this.clickedTicketEditOffers = true;
    this.vendorOffers = [];
    this.vendorOffersTicket = ticket;
    this.showGallery(ticket,0);
    this.timeToAssign = null;
    ticket.offers_list.forEach(element => {
      var item = {
        offerId: element._id,
        vendorName: element.companyName,
        vendorAddress: element.companyAddress,
        price: element.FixedPrice,
        note: element.ResponseComments,
        vendorRating: element.companyRank,
        vendorReviews: element.numberOfRanks,
        TicketAuth: element.TicketToken,
        TicketId: ticket.TicketId,
        ResponseId: element.ResponseId,
        ResponseComments: element.ResponseComments,
        expand: element.OfferStatus === 'Win' ? true : false,
        ArrivalDate: element.ArrivalDate,
        OfferStatus: element.OfferStatus
      };
      this.vendorOffers.push(item);
    });
    this.vendorOffersTicket
    // this.maintenanceService.getVendorOfferResponse(ticketKey)
    //   .then((data: any) => {
    //     this.vendorOffers = data.items
    //   }, _ => { })
  }

  assignVendor(offer) {
    // let ticket = this.tickets.find(t => t.key === ticketKey)
    // this.maintenanceService.assignVendor(offerKey)
    //   .then(() => {
    //     this.clickedTicketEditOffers = false
    //     ticket.status = "In_Progress"
    //   }, _ => {
    //     this.clickedTicketEditOffers = false
    //     ticket.status = "In_Progress"
    //   })
    if(this.timeToAssign == null || this.timeToAssign == undefined || this.timeToAssign == 0){
      this.timeToAssign = 0;
      offer.expand = true;
    }else{
      var headers = new Headers();
      var json = JSON.stringify(
        {
          OfferId: offer.offerId,
          AppCustomerAuth: this.vendorOffersTicket.FacilityId,
          TicketAuth: offer.TicketAuth,
          TicketId: offer.TicketId,
          ResponseId: offer.ResponseId,
          updEmail: this.email,
          updDisplayName: this.displayName,
          updPosition: this.position,
          status: this.statuses.Vendor_Assigned
        }
      );
      console.log(json);
      headers.append('Content-Type', 'application/X-www-form=urlencoded');
      headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
      //api/ManagerTickets
      this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/UpdateTicketExternalAssign', json, { headers: headers }).subscribe(
        (res: Response) => {
          const t = res.json();
          console.log(t)
        });
      this.clickedTicketEditOffers = false;
      offer.OfferStatus = 'Win';
      this.vendorOffersTicket.status = "Vendor_Assigned";
      this.vendorOffersTicket.lastUpdateDate = this.moment().valueOf();
      this.vendorOffersTicket.lastUpdateTitle = "Vendor assigned";
      this.vendorOffersTicket.lastUpdateFullname = this.displayName;
      this.vendorOffersTicket.lastUpdateEmail = this.email;
      this.vendorOffersTicket.lastUpdatePosition = this.position;
      this.vendorOffersTicket.vendorAssignedName = offer.vendorName;
      this.vendorOffersTicket.vendorAssignedDate = this.moment().valueOf();
    }
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
    this.nonHoverRating = goldIndex + 1;
    //this.toBeRated[0].vendor.rating = goldIndex + 1;
  }

  toggleHover() {
    this.isHoverMode = true;
  }

  toggleLeave() {
    this.isHoverMode = false;
  }

  isPast(time) {
    return Date.now() > +time
  }

  clickMarkAsFix(ticket) {
    // this.maintenanceService.sendFixProblemResolve(ticket.key, { lastStatusChanged: this.moment(), status: "Done" })
    //   .then(() => {
    //     ticket.status = this.statuses.Done;
    //     ticket.lastStatusChanged = this.moment().valueOf();

    //     ticket.moreInfo.push({ body: "TICKET-DONE", name: this.redux.getState().user.position })
    //     let newMoreInfo = ticket.moreInfo[ticket.moreInfo.length - 1]
    //     this.maintenanceService.updateMaintenanceTicket(ticket.key, { moreInfo: newMoreInfo })
    //       .then(() => { })
    //   })
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        TicketStatus: this.statuses.Resolved,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    //api/ManagerTickets
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/UpdateTicketStatus', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    ticket.status = this.statuses.Resolved;
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Ticket status was updated";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  translateTrueOrFalse(isTrue) {
    if (isTrue == 'unknown') return 'Unknown';
    else if (isTrue) return 'Yes';
    else if (!isTrue) return 'No';
    else return "";
  }

  showGallery(ticket, id) {
    this.imgGalleryTicket = ticket
    this.imgGalleryArray = [];
    this.imgGalleryPdf = [];
    this.imgGalleryVideo = [];
    this._albums = [];
    let i = 0;
    let nameFile;
    if (ticket.files) {
      if (id == 1) {
        this.imgGallerycurrentPhoto = ticket.files.tenantGallery[0].imageurl;
      }
      if (id == 2) {
        this.imgGallerycurrentPhoto = ticket.files.managementGallery[0].imageurl;
      }
      if (id == 3) {
        this.imgGallerycurrentPhoto = ticket.files.vendorGallery[0].imageurl;
      }
      if (id == 4) {
        if(ticket.files.tenantGallery.length.length > 0){this.imgGallerycurrentPhoto = ticket.files.tenantGallery[0].imageurl;}
        if(ticket.files.managementGallery.length > 0){this.imgGallerycurrentPhoto = ticket.files.managementGallery[0].imageurl;}
        if(ticket.files.vendorGallery.length > 0){this.imgGallerycurrentPhoto = ticket.files.vendorGallery[0].imageurl;}
      }
      if (ticket.files.tenantGallery.length > 0) {
        ticket.files.tenantGallery.forEach(element => {
          if(element.imageurl.slice(-3) === 'pdf'){
            this.imgGalleryPdf.push({ name: 'PDF ' + ++i, url: element.imageurl });
          }else if(element.imageurl.slice(-3) === 'mp4'){
            this.imgGalleryVideo.push({ name: 'Tenant : ' + element.uploaderName , url: element.imageurl });
          }else{
            this.imgGalleryArray.push({ name: 'Tenant : ' + element.uploaderName, url: element.imageurl });
            this._albums.push({src: element.imageurl ,caption: 'Tenant : ' + element.uploaderName ,thumb: element.imageurl});
          } 
        });
      }
      if (ticket.files.managementGallery.length > 0) {
        ticket.files.managementGallery.forEach(element => {
          if(element.imageurl.slice(-3) === 'pdf'){
            this.imgGalleryPdf.push({ name: 'PDF ' + ++i, url: element.imageurl });
          }else if(element.imageurl.slice(-3) === 'mp4'){
            this.imgGalleryVideo.push({ name: 'Manager : ' + element.uploaderName , url: element.imageurl });
          }else{
            this.imgGalleryArray.push({ name: 'Manager : ' + element.uploaderName, url: element.imageurl });
            this._albums.push({src: element.imageurl ,caption: 'Manager : ' + element.uploaderName ,thumb: element.imageurl});
          }
        });
      }
      if (ticket.files.vendorGallery.length > 0) {
        ticket.files.vendorGallery.forEach(element => {
          if(element.imageurl.slice(-3) === 'pdf'){
            this.imgGalleryPdf.push({ name: 'PDF ' + ++i, url: element.imageurl });
          }else if(element.imageurl.slice(-3) === 'mp4'){
              this.imgGalleryVideo.push({ name: 'vendor : ' + element.uploaderName , url: element.imageurl });
          }else{
            this.imgGalleryArray.push({ name: 'vendor : ' + element.uploaderName, url: element.imageurl });
            this._albums.push({src: element.imageurl ,caption: 'vendor : ' + element.uploaderName ,thumb: element.imageurl});
          }
        });
      }
    }
  }
  editTitleLabel(status) {
    if (status === 'Open' || status === 'Vendor_Required' || status === 'In_Progress') {
      return true;
    }
    return false;
  }

  fillTimeToAssign(num){
    this.timeToAssign = num;
  }

  openRatingDialog(ticket){
    this.rateShow = true;
    this.nonHoverRating = 1;
    this.rateTicket = ticket ;
    this.rateOffer = ticket.offers_list.find(t => t.OfferStatus === 'Done');
    this.rateTicket.costList = [];
  }

  openResolvedDialog(ticket){
    this.ResolvedDoneShow = true;
    this.nonHoverRating = 0;
    this.rateTicket = ticket ;
    this.rateTicket.costList = [];
  }

  openDoneDialog(ticket){
    this.ResolvedDoneShow = true;
    this.nonHoverRating = 1;
    this.rateTicket = ticket ;
    this.rateTicket.costList = [];
  }

  openFixedDialog(ticket){
    this.fixedShow = true;
    this.rateTicket = ticket ;
    this.rateTicket.costList = [];
  }


  addCost(){
    this.rateTicket.costList.push({id:this.rateTicket.costList.length + 1, amount:'', note:'', edit:true})
  }

  removeCost(costItem){
    this.rateTicket.costList = this.rateTicket.costList.filter(item => item !== costItem)
  }

  removeAttachments(attachmentItem){
    this.rateTicket.closeAttachments = this.rateTicket.closeAttachments.filter(item => item !== attachmentItem)
    //TODO: add delete from server after 6 sec add snake bar for undo add delete from cloudinary
  }

  renameAttachments(attachmentItem){
    attachmentItem.fileName = attachmentItem.rename;
    attachmentItem.edit = !attachmentItem.edit
    //TODO: rename attachment name in server
  }

  undoRenameAttachments(attachmentItem){
    attachmentItem.rename =attachmentItem.fileName;
    attachmentItem.edit = !attachmentItem.edit
    //TODO: rename attachment name in server
  }

  rateVendor(textbox) {
    this.ratingLoading = true
    // this.maintenanceService.rateTicket(this.currentlyRating.key, this.currentlyRating.vendor.rating)
    //   .then((data) => {
    //     delete this.currentlyRating
    //     this.toBeRated.splice(0, 1)
    //     this.currentlyRating = this.toBeRated[0]
    //     this.ratingLoading = false
    //   })
    var headers = new Headers();
    var json = JSON.stringify(
      {
        facilityId: this.rateTicket.FacilityId,
        generalRank: this.nonHoverRating.toString(),
        reviewFreeText : textbox,
        ticketLongId:  this.rateTicket._id,
        vendorCompanyId:  this.rateOffer.companyId,
        updDisplayName: this.displayName,
        updEmail: this.email,
        updPosition: this.position,
        reviewType: 'Manager'
      }
    );
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/Reviews/SendNewReview', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });

    // this.rateTicket.status = "Resolved";
    // this.rateTicket.lastUpdateDate = this.moment().valueOf();
    // this.rateTicket.lastUpdateTitle = "Vendor rated";
    // this.rateTicket.lastUpdateFullname = this.displayName;
    // this.rateTicket.lastUpdateEmail = this.email;
    // this.rateTicket.lastUpdatePosition = this.position;
    this.ratingLoading = false;
    this.rateShow = false;
  }

  onDocumentClick(event) {
		Array.prototype.forEach.call(document.getElementsByClassName('drop-down'), (element: HTMLDivElement, index) => {
			let clickedOnDropdown = element.contains(event.target)
			let clickedOnSelector = element.parentElement.getElementsByClassName("selector")[0].contains(event.target)
			if (!clickedOnDropdown && !clickedOnSelector && element.style.display !== "none") {
				element.style.display = "none"
			}
    })
  }
  
  AssignInternal(ticket){
    //TicketOpenerId: ticket.TicketOpenerId,
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        TicketStatus: this.statuses.Assigned,
        AppId: ticket.AppId,
        TicketOpenerId: ticket._id,
        requestEmail: this.email,
        requestDisplayName: this.displayName,
        requestPosition: this.position,
        requestComments: "",
        availlability: "",
        responseEmail: ticket.selectedJanitor.email,
        responseDisplayName: ticket.selectedJanitor.firstName + " " + ticket.selectedJanitor.lastName,
        responsePosition: ticket.selectedJanitor.position
      }
    );  
    console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/UpdateTicketInternalAssign', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        console.log(t)
      });
    //ticket.status = 'In_Progress';
    ticket.status = 'Assigned';
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Ticket status was updated to Assigned";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  isVendorAssigned(ticket){
    if(ticket.status === 'Vendor_Assigned' || ticket.status === 'Vendor_Resolved' || ticket.status === 'Vendor_In_Progress'){
      return true;
    }
    return false;
  }

  open(index: number): void {
    // open lightbox
    //this._lightbox.open(this._albums, index);
    this._lightbox.open(this._albums, index, { wrapAround: true, showImageNumberLabel: true });
  }
  
  sendRemainderToStaff(ticket){

  }

  uploadProgress(e){
    this.uploadProgresspercentage = e;
  }
}
