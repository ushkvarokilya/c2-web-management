import { Component, OnInit, Renderer2, ɵConsole } from '@angular/core';
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
import { filter, takeWhile, concatAll, map } from 'rxjs/operators';

import { Lightbox } from 'angular2-lightbox';
import { AngularFireDatabase, AngularFireList, AngularFireAction } from '@angular/fire/database';
import { MatSnackBar } from '@angular/material';
import { speedDialFabAnimations } from './speed-dial-fab.animations';
//import moment = require('moment');

@Component({
  selector: 'app-maintenance-plus',
  templateUrl: './maintenance-plus.component.html',
  styleUrls: ['./maintenance-plus.component.scss'],
  animations: speedDialFabAnimations,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class MaintenancePlusComponent implements OnInit {

  @select() user$: Observable<User>
  @select() company$: Observable<Company>

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  expandPayment = false
  searchQuery
  clickedTicketEditOffers
  tickets = []
  rating = 1
  nonHoverRating = 1
  isHoverMode = false
  tempRating
  clickedTicket
  confirmTicket

  clickedConfirm
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
  AssignedNum = 0
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
  accountingServer = environment.accounting_api_endpoint;
  redirectUrlVendors = environment.redirect_url_vendors;

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
  jusers = [];

  uploadProgresspercentage = 0;
  private _albums = [];

  complex;
  currentComplexKey = localStorage.getItem('currentComplexKey');
  vendorsToken = localStorage.getItem('vendorsToken');
  companyKey;

  openTicket = false;
  openTicketNext = true;
  newTicket;
  areaZone;
  unitNumber = null;

  errorMsg = { isError: false, message: '' };

  units = [];
   ConfirmShow: boolean;
   totalCost = 0;

  constructor(private redux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private complexService: ComplexService,
    private maintenanceService: MaintenanceService,
    private messagesService: MessagingService,
    private vendorService: VendorService,
    private http: Http,
    private _lightbox: Lightbox,
    public db: AngularFireDatabase,
    public snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {

    this.hours = []
    for (let i = 1; i <= 23; i++) this.hours.push(i)
    this.minutes = []
    for (let i = 0; i <= 59; i++) this.minutes.push(i)

    this.itemsRef = db.list('messages');
    // Use snapshotChanges().map() to store the key
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    if (this.redux.getState().user.isJanitor) {
      this.show = "Janitor"
    }

    this.user$.subscribe(user => {
      //console.log(user);
      this.email = user.email;
      this.position = user.position;
      this.displayName = user.firstName + ' ' + user.lastName;
      this.key = user.key;
      this.companyKey = user.companyKey;

      if (user.isJanitor) {
        this.show = "Janitor"
      } else {
        this.show = "Location Manager"
      }
    })

    //let dataFromServerFetched = false;
    //let keys = [];
    // this.user$
    //   .pipe(
    //     filter(user => user.token !== null),
    //     takeWhile(_ => !dataFromServerFetched)
    //   )
    //   .subscribe(user => {
    //     dataFromServerFetched = true
    //     let comKey = 'ag9lfmMyLWRldi1zZXJ2ZXJyFAsSB0NvbXBhbnkYgICAgL_-1gkM';
    //     //user.companyKey
    //     this.companyService.getComplexesDetailed(comKey)
    //       .then((data: any) => {
    //         //console.log(data);
    //         this.facilities = data.facilities;
    //         let facility = data.facilities.find(f => f.key === localStorage.getItem('currentComplexKey'));
    //         keys = facility.janitorKeys;
    //       })
    //     setTimeout(() => {
    //       this.companyService.getCompanyUsers(comKey)
    //         .then((data: any) => {
    //           this.users = data.users;
    //           this.jusers = data.users;
    //           //console.log(this.users);
    //           //console.log(this.jusers);
    //         })
    //     }, 2000)
    //   })

    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && !this.dataLoaded) {
        this.complexKey = company.currentComplex.key
        this.complex = company.currentComplex;
        //console.log(company);
        //this.loadTickets()

        this.connectToVendors();
        this.LoadEmployees();
        this.GetTicketsFromVendors();
        this.LoadUnits();
        this.dataLoaded = true
      }
    })

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.searchQuery) this.searchQuery = params.searchQuery;
      if (params['key']) this.searchQuery = params['key'];
    })

    this.activatedRoute.queryParams.subscribe((params: any) => {
      //console.log(params);
    })

    this.initChooseVendor()
  }

  ngAfterContentInit() {
    this.LoadCategories();

  }

  selectJanitor(user, ticket) {
    ticket.selectedJanitor = user;
    return true;
  }

  addItem(newName: string) {
    this.itemsRef.push({ text: newName });
  }
  updateItem(key: string, newText: string) {
    this.itemsRef.update(key, { text: newText });
  }
  deleteItem(key: string) {
    this.itemsRef.remove(key);
  }
  deleteEverything() {
    this.itemsRef.remove();
  }

  LoadUnits() {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
    this.http.get(this.accountingServer + 'Temp/' + this.complex.code + '/units', { headers: headers })
      .subscribe((res: Response) => {
        this.units = res.json();
      });
  }

  LoadCategories() {
    let vendorsToken = localStorage.getItem('vendorsToken');
    var headers = new Headers();
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Bearer ' + vendorsToken);
    this.http.get(this.vendorServer + 'manager/GetCategories/', { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t);
        this.categories = t.categories;
      });
  }

  LoadEmployees() {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.get(this.vendorServer + 'manager/getEmployees/' + this.companyKey, { headers: headers })
      .subscribe((res: Response) => {
        const data = res.json();
        //console.log('manager/getEmployees/All', data);
        data.employees.forEach(emp => {
          emp.communities.forEach(x => {
            if (x.communityId == this.complex.key) {
              this.jusers.push(emp);
            }
          })
        });
        //console.log('manager/getEmployees/In', this.jusers);
      });
  }

  LoadCategoriesdialog(ticket) {
    this.showEditInfo = true;
    this.ticketCategory = ticket;
    this.mainCategory = this.categories.find(t => t.categoryName === ticket.TicketTitle);
    this.subCategory = ticket.TicketSubTitle;
  }

  updateTitleAndSubtitle(ticket, category, sub) {
    let currentComplexKey = localStorage.getItem('currentComplexKey');
    var headers = new Headers();
    var json = JSON.stringify(
      {
        userId: this.key,
        logFullName: this.displayName,
        logEmail: this.email,
        logPosition: this.position,
        ticketTitle: category,
        ticketSubTitle: sub,
        ticketProfessionalField: category

      });
    //console.log(currentComplexKey, json);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/updateTicketCategory/' + currentComplexKey + '/' + ticket._id, json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t);
        this.openSnackBar(t.message, 'Dismiss');
      });
    this.showEditInfo = false;

    ticket.TicketTitle = category;
    ticket.TicketSubTitle = sub;
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
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.get(this.vendorServer + 'manager/GetTickets/' + localStorage.getItem('currentComplexKey'), { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t);
          if (t && t.tickets && t.tickets.length > 0) {
            this.tickets = t.tickets.map(ticket => {
              ticket.TicketDate = ticket.ticketCreatedDate;
              ticket.estimatedWorkTime = +ticket.estimatedWorkTime
              ticket.closedTime = +ticket.closedTime
              ticket.dateCreated = +ticket.dateCreated
              ticket.mainImg = [];
              if (ticket.files) {
                if (ticket.files.tenantGallery.length > 0) {
                  ticket.currentPhoto = ticket.files.tenantGallery[0].imageUrl;
                  ticket.mainImg.push({ id: 1, description: "Resident : " + ticket.files.tenantGallery[0].uploaderName, url: ticket.currentPhoto, size: ticket.files.tenantGallery.length - 1 });
                }
                if (ticket.files.managementGallery.length > 0) {
                  ticket.currentPhoto = ticket.files.managementGallery[0].imageUrl;
                  ticket.mainImg.push({ id: 2, description: "Manager : " + ticket.files.managementGallery[0].uploaderName, url: ticket.currentPhoto, size: ticket.files.managementGallery.length - 1 });
                }
              }

              ticket.ticketNumber = ticket.ticketId ? ticket.ticketId.substring(4) : 'Number';
              ticket.showDetails = false;
              ticket.selected = false;

              if (ticket.ticketStatus !== null && ticket.ticketStatus !== undefined) {
                ticket.status = ticket.ticketStatus.replace(' ', '_').replace(' ', '_');
              }
              if (ticket.ticketStatus === 'Tenant Done') {
                ticket.status = 'Done';
              }
              if (ticket.statusHistory && ticket.statusHistory.length > 0) {
                const len = ticket.statusHistory.length - 1;
                ticket.lastUpdateDate = new Date(ticket.statusHistory[len].logDate);
                ticket.lastUpdateTitle = ticket.statusHistory[len].logTitle;
                ticket.lastUpdateFullname = ticket.statusHistory[len].logFullName;
                ticket.lastUpdateEmail = ticket.statusHistory[len].logEmail;
                ticket.lastUpdatePosition = ticket.statusHistory[len].logPosition;
              }
              ticket.createdDate = new Date(ticket.ticketCreatedDate);
              ticket.createdFullname = ticket.ticketOpenerFullname;
              ticket.createdEmail = ticket.openerEmail;
              ticket.createdPosition = "Resident";

              ticket.problemArea = ticket.ticketAreaZone.replace(' ', '');

              if (ticket.offers && ticket.offers.length > 0) {
                ticket.offers.forEach(element => {
                  if (element.status === 'Win' || element.status === 'Done' || element.status === "In Progress") {
                    ticket.vendorAssignedName = element.companyName;
                    ticket.vendorAssignedDate = element.ArrivalDate;
                  }
                });
              }

              if (ticket.internalAssignments.length > 0) {
                ticket.internalAssignments[0].assignmentDateFormat = new Date(ticket.internalAssignments[0].assignmentDate);
              }

              if (ticket.ticketDescription !== '') {
                ticket.additionalInformation.unshift({
                  _id: "0",
                  msgDate: ticket.createdDate.getTime(),
                  msgContent: ticket.ticketDescription,
                  msgSenderEmail: ticket.ticketOpenerEmail,
                  msgSenderDisplayName: ticket.ticketOpenerFullname + ' (' + ticket.createdPosition + ') ',
                  isMessagePrivate: false
                });
              }

              ticket.closeAttachments = [];
              ticket.costList = [];
              ticket.closeNote = ticket.closeTicket.note ? ticket.closeTicket.note : '';
              if (ticket.closeTicket.attachments.length > 0)
                ticket.closeTicket.attachments.forEach(x => {
                  let arr = x.attachmentSource.split('.');
                  ticket.closeAttachments.push({
                    url: x.attachmentSource,
                    name: x.name || '',
                    fileName: x.attachmentNote,
                    fileEnd: arr[arr.length - 1],
                    rename: x.attachmentNote,
                    edit: false
                  });
                });
              if (ticket.closeTicket.costs.length > 0)
                ticket.closeTicket.costs.forEach(x => {
                  ticket.costList.push({ amount: +x.costValue, note: x.costDescription, edit: false });
                });
              ticket.selectedJanitor = null;
              ticket.TicketTitle = ticket.ticketTitle ? ticket.ticketTitle.substring(0, 50) : '';
              ticket.TicketSubTitle = ticket.ticketSubTitle ? ticket.ticketSubTitle.substring(0, 50) : '';

              if (ticket.requestTimeFrame) {
                ticket.timeFrame = ticket.requestTimeFrame.map(item => {
                  item.date = Moment(new Date(item.date), 'DD MMM YY');
                  item.date = this.moment(item.date).format('DD MMM YY');
                  return item;
                });
              }
              ticket.timeFrame = ticket.timeFrame || [];
              ticket.timeType = ticket.requestASAP ? 'ASAP' : 'TIMEFRAME';

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
            console.log(this.tickets)
          } else {
            this.mainMessage = "No Tickets"
          }
        });
  }

  connectToVendors() {
    let user_details = JSON.parse(localStorage.getItem('user_details'));
    let complex = localStorage.getItem('currentComplexKey');
    var headers = new Headers();
    var json = JSON.stringify({
      communityId: complex,
      companyId: user_details.companyKey,
      communityAddress: this.complex.address,
      communityName: this.complex.name,
      communityCity: '',
      communityCountry: ''
    });
    headers.append('Content-Type', 'application/json');
    this.http.post(this.vendorServer + 'clients/register', json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const result = res.json();
          if (result.token) {
            localStorage.setItem('vendorsToken', result.token);
            this.vendorsToken = result.token;
          } else {
            //console.log(result);
            this.openSnackBar(result.message, 'Dismiss');
            localStorage.setItem('vendorsToken', result.AppClienMessage.token);
            this.vendorsToken = result.AppClienMessage.token;
          }
        });
  }

  moment(date = Date.now()) {
    return Moment(+date)
  }

  addImageToTicket(ticket, imageUrl) {
    let currentComplexKey = localStorage.getItem('currentComplexKey');
    let item = ticket.mainImg.filter(item => item.id === 2)
    let itemSize = item == null ? 0 : item.size;
    ticket.mainImg = ticket.mainImg.filter(item => item.id !== 2)
    ticket.mainImg.push({ id: 2, description: "Manager : " + this.displayName, url: imageUrl.url, size: itemSize + 1 });
    ticket.currentPhoto = imageUrl.url;
    let fileUrl = imageUrl.url.split('.');

    ticket.files.managementGallery.push(
      {
        isPublic: false,
        _id: Math.floor((Math.random() * 9999999) + 1000000),
        imageUrl: imageUrl.url,
        uploadDate: Date.now(),
        uploaderName: this.displayName,
        fileExt: fileUrl[fileUrl.length - 1],
        fileName: this.displayName
      }
    );

    var headers = new Headers();
    var json = JSON.stringify(
      {
        requestId: ticket._id,
        imageUrl: imageUrl.url,
        requestEmail: this.email,
        requestDisplayName: this.displayName,
        requestPosition: this.position,
        uploaderName: this.displayName,
        // uploadDate: new Date().getTime(),
        fileExt: fileUrl[fileUrl.length - 1],
        fileName: this.displayName
      });
    //console.log(json)
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/UploadImageToTicket/' + ticket._id + '/' + currentComplexKey, json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t)
      });
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Image was added";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
    // this.maintenanceService.updateMaintenanceTicket(ticket.key, { photoUrl: imageUrl })
    //   .then(() => { })
  }

  addImageToCloseTicket(ticket, imageUrl) {
    ticket.closeAttachments.push({ url: imageUrl.url, name: "Manager : " + this.displayName, fileName: imageUrl.name.split(".")[0], fileEnd: imageUrl.name.split(".")[1], rename: imageUrl.name.split(".")[0], edit: false });

    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Image was added";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
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

    if (text.length > 0) {
      ticket.additionalInformation.push({
        msgContent: text,
        msgSenderDisplayName: this.displayName + ' (' + this.position + ') ',
        msgSenderEmail: this.email,
        isMessagePrivate: false,
        msgDate: new Date().getTime()
      });

      var headers = new Headers();
      var json = JSON.stringify(
        {
          msgContent: text,
          msgSenderDisplayName: this.displayName + ' (' + this.position + ') ',
          msgSenderEmail: this.email,
          isMessagePrivate: false
        }
      );
      //console.log(json);
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this.vendorsToken);
      this.http.post(this.vendorServer + 'manager/PostAdditionalInformation/' + ticket._id + '/' + ticket.communityId, json, { headers: headers }).subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t)
        });
    }
  }

  vendorRequired(ticket) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        userId: this.key,
        logFullName: this.displayName,
        logEmail: this.email,
        logPosition: this.position,
        ticketStatus: this.statuses.Vendor_Required
      }
    );
    //console.log(json)
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/UpdateTicketStatus/' + ticket._id + '/' + ticket.communityId, json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t)
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
    this.AssignedNum = 0
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
        case "Assigned":
          this.AssignedNum++;
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
    //console.log(ticket);
    this.errorMsg = { isError: false, message: '' };
    this.clickedTicket = ticket;
    console.log(ticket)
    this.vendors = [];
    this['loadingVendors'] = true;
    //this.showGallery(ticket, 0);

    let i = 0;
    let checkedSubCategory = null;
    let checkedCategory = null;
    let flag = false;
    // this.categories.forEach(element => {
    //   let vendor = [];
    //   element.subs.forEach(vendors => {
    //     vendor.push({ key: ++i, firstName: vendors.name, checked: false });
    //     if (vendors.name === ticket.TicketSubTitle) {
    //       flag = true;
    //       checkedSubCategory = { key: i, firstName: vendors.name, checked: false };
    //     }
    //   });
    //   this.vendors.push({ type: element.proname, vendors: vendor, checked: false });
    //   if (flag) checkedCategory = { type: element.proname, vendors: vendor, checked: false };
    // });
    //(vendor, group)
    //this.checkVendor(checkedSubCategory, checkedCategory);
    this['loadingVendors'] = false;
  }

  removeAdditionalInformationCVD() {
    (document.querySelector('#additionalInformationCVD') as HTMLElement).style.border = 'none';
    this.errorMsg = { isError: false, message: '' };
  }

  checkSendVendorAuction(ticket) {
    let additionalInformation = ticket.additionalInformation.filter(x => x._id != '0' && x.isMessagePrivate == true);
    let timeFrame = ticket.timeFrame.filter(x => x.date != '' && x.am_pm != '');
    ticket.timeFrame = timeFrame;

    ticket.timeFrame = ticket.timeFrame.filter((item, index, self) =>
      index === self.findIndex(x => x.date === item.date && x.am_pm === item.am_pm)
    )

    if (additionalInformation.length === 0) {
      (document.querySelector('#additionalInformationCVD') as HTMLElement).style.border = '1px solid red';
      return { isError: true, message: 'Please fix the errors in the form to continue' };
    }

    if (timeFrame.length === 0 && ticket.timeType === 'TIMEFRAME') {
      (document.querySelector('#timeFrame') as HTMLElement).style.border = '1px solid red';
      return { isError: true, message: 'Please fix the errors in the form to continue' };
    }

    return { isError: false, message: '' };
  }

  //vova
  sendVendorAuction(ticket) {
    const error = this.checkSendVendorAuction(ticket);
    this.errorMsg = error;

    if (!error.isError) {
      var headers = new Headers();
      var json = JSON.stringify(
        {
          userId: this.key,
          logFullName: this.displayName,
          logEmail: this.email,
          logPosition: this.position,
          ticketStatus: this.statuses.Auction_Created,
          additionalInformation: ticket.additionalInformation.filter(x => x._id != '0'),
          requestTimeFrame: ticket.timeFrame,
          requestASAP: ticket.timeType === 'ASAP',
          files: ticket.files
        }
      );
      //console.log(json);
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this.vendorsToken);
      this.http.post(this.vendorServer + 'manager/CreateRequest/' + ticket._id + '/' + this.complex.key, json, { headers: headers })
        .toPromise().then(
          (res: Response) => {
            const result = res.json();
            //console.log(result)
            this.openSnackBar(result.message, 'Dismiss');
          });
      this.clickedTicket = null;
      ticket.status = 'Auction_Created';
      ticket.lastUpdateDate = this.moment().valueOf();
      ticket.lastUpdateTitle = "Ticket status was updated";
      ticket.lastUpdateFullname = this.displayName;
      ticket.lastUpdateEmail = this.email;
      ticket.lastUpdatePosition = this.position;
    }
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
    //console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/CancelAuctionRequest', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t)
      });
    this.clickedTicket = null;
    ticket.status = 'In_Progress';
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Auction canceled";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  cancelVendorAssignment(ticket, offer) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        _id: ticket._id,
        FacilityId: ticket.FacilityId,
        AppId: ticket.AppId,
        TicketOpenerId: ticket.TicketOpenerId,
        OfferId: offer.offerId,
        AppCustomerAuth: ticket.FacilityId,
        TicketAuth: ticket._id,
        TicketId: ticket.TicketId,
        ResponseId: offer.ResponseId,
        updEmail: this.email,
        updDisplayName: this.displayName,
        updPosition: this.position
      }
    );

    //console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/ManagerTicketUpdates/CancelVendorAssignment', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t)
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
    if (vendor.firstName === 'Other' && vendor.checked == false) {
      this.otherCategory = group.type + " , " + vendor.firstName + " -";
    } else {
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
    this.errorMsg = { isError: false, message: '' };
  }

  showVendorOffersResponses(ticket) {
    this.clickedTicketEditOffers = true;
    this.vendorOffers = [];
    this.vendorOffersTicket = ticket;
    this.timeToAssign = null;
    this.vendorOffersTicket.offers = this.vendorOffersTicket.offers.map(offer => {
      offer.price = 0;
      offer.additionalItems.forEach(element => {
        offer.price += element.price;
      });
      offer.availabilities.forEach(element => {
        element.displayDate = new Date(element.date);
      });

      offer.availabilities.sort((a, b) => {
        if (b.displayDate - a.displayDate == 0) {
          if (a.am_pm == "AM" && b.am_pm == "PM") return -1;
          else return 0;
        }
        return a.displayDate - b.displayDate;
      });
      return offer;
    });
  }

  assignVendor(offer) {
    this.timeToAssign = this.vendorOffersTicket.requestASAP ? -1 : this.timeToAssign;
    if (this.timeToAssign == null || this.timeToAssign == undefined || this.timeToAssign == 0) {
      this.timeToAssign = 0;
      offer.expand = true;
    } else {
      if (this.timeToAssign != -1) {
        this.timeToAssign.isSelectedBycommunity = true;
        offer.availabilities.forEach(element => {
          if (element._id === this.timeToAssign._id) {
            element = this.timeToAssign;
          }
        });
      }

      var headers = new Headers();
      var json = JSON.stringify(
        {
          offerId: offer.key,
          userId: this.key,
          logFullName: this.displayName,
          logEmail: this.email,
          logPosition: this.position,
          status: this.statuses.Vendor_Assigned,
          availabilities: offer.availabilities
        }
      );
      //console.log(json);
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Bearer ' + this.vendorsToken);
      this.http.post(this.vendorServer + 'manager/SelectOffer/' + this.vendorOffersTicket._id + '/' + this.vendorOffersTicket.communityId, json, { headers: headers }).subscribe(
        (res: Response) => {
          const t = res.json();
          this.openSnackBar(t.message, 'Dismiss');
          //console.log(t)
        });
      this.clickedTicketEditOffers = false;
      offer.status = 'Accepted';
      this.vendorOffersTicket.status = "Vendor_Assigned";
      this.vendorOffersTicket.lastUpdateDate = this.moment().valueOf();
      this.vendorOffersTicket.lastUpdateTitle = "Vendor assigned";
      this.vendorOffersTicket.lastUpdateFullname = this.displayName;
      this.vendorOffersTicket.lastUpdateEmail = this.email;
      this.vendorOffersTicket.lastUpdatePosition = this.position;
      this.vendorOffersTicket.vendorAssignedName = offer.nativeAccountName;
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
    var headers = new Headers();
    var json = JSON.stringify(
      {
        userId: this.key,
        logFullName: this.displayName,
        logEmail: this.email,
        logPosition: this.position,
        ticketStatus: this.statuses.Resolved
      }
    );
    //console.log(json)
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/UpdateTicketStatus/' + ticket._id + '/' + ticket.communityId, json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t)
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
        this.imgGallerycurrentPhoto = ticket.files.tenantGallery[0].imageUrl;
      }
      if (id == 2) {
        this.imgGallerycurrentPhoto = ticket.files.managementGallery[0].imageUrl;
      }
      if (id == 3) {
        if (ticket.files.tenantGallery.length.length > 0) { this.imgGallerycurrentPhoto = ticket.files.tenantGallery[0].imageUrl; }
        if (ticket.files.managementGallery.length > 0) { this.imgGallerycurrentPhoto = ticket.files.managementGallery[0].imageUrl; }
      }
      if (ticket.files.tenantGallery.length > 0) {
        ticket.files.tenantGallery.forEach(element => {
          if (element.imageUrl.split('.')[element.imageUrl.split('.').length - 1] === 'pdf') {
            this.imgGalleryPdf.push({ name: 'PDF ' + ++i, url: element.imageUrl });
          } else if (element.imageUrl.split('.')[element.imageUrl.split('.').length - 1] === 'mp4') {
            this.imgGalleryVideo.push({ name: 'Tenant : ' + element.uploaderName, url: element.imageUrl });
          } else {
            this.imgGalleryArray.push({ name: 'Tenant : ' + element.uploaderName, url: element.imageUrl });
            this._albums.push({ src: element.imageUrl, caption: 'Tenant : ' + element.uploaderName, thumb: element.imageUrl });
          }
        });
      }
      if (ticket.files.managementGallery.length > 0) {
        ticket.files.managementGallery.forEach(element => {
          if (element.imageUrl.split('.')[element.imageUrl.split('.').length - 1] === 'pdf') {
            this.imgGalleryPdf.push({ name: 'PDF ' + ++i, url: element.imageUrl });
          } else if (element.imageUrl.split('.')[element.imageUrl.split('.').length - 1] === 'mp4') {
            this.imgGalleryVideo.push({ name: 'Manager : ' + element.uploaderName, url: element.imageUrl });
          } else {
            this.imgGalleryArray.push({ name: 'Manager : ' + element.uploaderName, url: element.imageUrl });
            this._albums.push({ src: element.imageUrl, caption: 'Manager : ' + element.uploaderName, thumb: element.imageurl });
          }
        });
      }
    }
  }

  showVendorGallery(offer) {
    this._albums = [];
    let i = 0;
    let nameFile;
    if (offer.vendor_images.length > 0) {
      offer.vendor_images.forEach(element => {
        var endFile = element.imageurl.split('.')[element.imageurl.split('.').length - 1];
        if (endFile === 'pdf' || endFile === 'mp4' || endFile === 'svg') {
        } else {
          this._albums.push({ src: element.imageurl, caption: 'Manager : ' + element.uploaderName, thumb: element.imageurl });
        }
      });
    }
  }

  editTitleLabel(status) {
    if (status === 'Open' || status === 'Vendor_Required' || status === 'In_Progress') {
      return true;
    }
    return false;
  }

  fillTimeToAssign(num) {
    this.timeToAssign = num;
  }

  openRatingDialog(ticket) {
    this.rateShow = true;
    this.nonHoverRating = 1;
    this.rateTicket = ticket;
    this.rateOffer = ticket.offers_list.find(t => t.OfferStatus === 'Done');
  }

  openResolvedDialog(ticket) {
    this.ResolvedDoneShow = true;
    this.nonHoverRating = 0;
    this.rateTicket = ticket;
  }

  openDoneDialog(ticket) {
    this.ResolvedDoneShow = true;
    this.nonHoverRating = 1;
    this.rateTicket = ticket;
  }

  openFixedDialog(ticket) {
    this.fixedShow = true;
    this.rateTicket = ticket;
  }

  openConfirmDialog(message: string, action: string, ticket: any) {
    this.ConfirmShow = true;
    this.nonHoverRating = 0;
    this.rateTicket = ticket;
  //  this.clickedConfirm = ticket;
    ticket.offers = ticket.offers.filter(next => {
      return next.status === "Accepted";
    });

    console.log(ticket);
  }



  addCostMoney(costAmout: any) {
    this.totalCost = this.totalCost + costAmout;
  }
  addCost() {
    this.rateTicket.costList.push({ amount: '', note: '', edit: true });
  }



  removeCost(costItem) {
    this.rateTicket.costList = this.rateTicket.costList.filter(item => item !== costItem);
    this.totalCost = this.totalCost - costItem;
  }

  removeAttachments(attachmentItem) {
    this.rateTicket.closeAttachments = this.rateTicket.closeAttachments.filter(item => item !== attachmentItem)
    //TODO: add delete from server after 6 sec add snake bar for undo add delete from cloudinary
  }

  renameAttachments(attachmentItem) {
    attachmentItem.fileName = attachmentItem.rename;
    attachmentItem.edit = !attachmentItem.edit
    //TODO: rename attachment name in server
  }

  undoRenameAttachments(attachmentItem) {
    attachmentItem.rename = attachmentItem.fileName;
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
        reviewFreeText: textbox,
        ticketLongId: this.rateTicket._id,
        vendorCompanyId: this.rateOffer.companyId,
        updDisplayName: this.displayName,
        updEmail: this.email,
        updPosition: this.position,
        reviewType: 'Manager'
      }
    );
    //console.log(json)
    headers.append('Content-Type', 'application/X-www-form=urlencoded');
    headers.append('Authorization', 'Basic NU85Zm54eW8xVWlVQjU2aHpNbDZRcVpWb3laTm9qOWo6ODc5MTIxNTczNzk4');
    this.http.post(this.vendorServer + 'api/Reviews/SendNewReview', json, { headers: headers }).subscribe(
      (res: Response) => {
        const t = res.json();
        //console.log(t)
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

  AssignInternal(ticket) {
    var headers = new Headers();
    var json = JSON.stringify(
      {
        requestId: this.key,
        responseId: ticket.selectedJanitor.userKey,
        ticketStatus: this.statuses.Assigned,
        requestEmail: this.email,
        requestDisplayName: this.displayName,
        requestPosition: this.position,
        requestComments: '',
        availlability: '',
        responseEmail: ticket.selectedJanitor.userContact.email_address,
        responseDisplayName: ticket.selectedJanitor.userFirstName + ' ' + ticket.selectedJanitor.userLastName,
        responsePosition: ticket.selectedJanitor.position,
        assignStatus: 'add',
        redirectUrl: this.redirectUrlVendors + ticket.ticketNumber
      }
    );
    //console.log(json);
    //console.log(ticket.selectedJanitor);
    //console.log(ticket._id, this.currentComplexKey);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/TicketInternalAssignment/' + ticket._id + '/' + this.currentComplexKey, json, { headers: headers })
      .subscribe((res: Response) => {
        const t = res.json();
        if (t.message === 'Ticket was successfully updated') {
          ticket.status = 'Assigned';
          ticket.lastUpdateDate = this.moment().valueOf();
          ticket.lastUpdateTitle = "Ticket status was updated to Assigned";
          ticket.lastUpdateFullname = this.displayName;
          ticket.lastUpdateEmail = this.email;
          ticket.lastUpdatePosition = this.position;
          ticket.internalAssignments.push({
            "responseEmail": ticket.selectedJanitor.userContact.email_address,
            "responseDisplayName": ticket.selectedJanitor.userFirstName + " " + ticket.selectedJanitor.userLastName,
            "responsePosition": ticket.selectedJanitor.position,
            "assignmentDateFormat": new Date()
          });
        }
        this.openSnackBar(t.message, 'Dismiss');
        //console.log(t)
      },
        error => {
          const result = JSON.parse(error._body);
          //console.log(result);
          this.openSnackBar(result.message, 'Dismiss');
        });
  }

  isVendorAssigned(ticket) {
    if (ticket.status === 'Vendor_Assigned' || ticket.status === 'Vendor_Resolved' || ticket.status === 'Vendor_In_Progress') {
      return true;
    }
    return false;
  }

  open(index: number): void {
    // open lightbox
    //this._lightbox.open(this._albums, index);
    this._lightbox.open(this._albums, index, { wrapAround: true, showImageNumberLabel: true });
  }

  sendReminderToStaff(ticket) {
    let currentComplexKey = localStorage.getItem('currentComplexKey');
    let vendorsToken = localStorage.getItem('vendorsToken');
    let arr = ticket.internalAssignments.map(e => { return e.responseEmail });

    var headers = new Headers();
    var json = JSON.stringify(
      {
        userId: this.key,
        toEmail: arr.toString(),
        requestDisplayName: this.displayName,
        requestEmail: this.email,
        requestPosition: this.position,
        redirectUrl: this.redirectUrlVendors + ticket.ticketNumber
      }
    );
    //console.log(json);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + vendorsToken);
    this.http.post(this.vendorServer + 'manager/SendReminder/' + ticket._id + '/' + currentComplexKey, json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const result = res.json();
          //console.log(result)
          this.openSnackBar(result.message, 'Dismiss');
        });
    //console.log("sendRemainderToStaff");
  }

  uploadProgress(e) {
    this.uploadProgresspercentage = e;
  }

  removeInternalAssignments(ticket, user) {
    let currentComplexKey = localStorage.getItem('currentComplexKey');
    let vendorsToken = localStorage.getItem('vendorsToken');
    ticket.internalAssignments = ticket.internalAssignments.filter(item => item !== user);
    var headers = new Headers();
    var json = JSON.stringify(
      {
        userId: user._id,
        ticketStatus: ticket.internalAssignments.length > 0 ? this.statuses.Assigned : this.statuses.Open,
        requestDisplayName: this.displayName,
        requestEmail: this.email,
        requestPosition: this.position,
      }
    );
    //console.log(json);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + vendorsToken);
    this.http.post(this.vendorServer + 'manager/TicketInternalUnassignment/' + ticket._id + '/' + currentComplexKey + '/' + user._id, json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t)
        });
    ticket.status = ticket.internalAssignments.length > 0 ? this.statuses.Assigned : this.statuses.Open;
    ticket.lastUpdateDate = this.moment().valueOf();
    ticket.lastUpdateTitle = "Worker was removed from ticket";
    ticket.lastUpdateFullname = this.displayName;
    ticket.lastUpdateEmail = this.email;
    ticket.lastUpdatePosition = this.position;
  }

  CloseTicketSaveOrClose(ticket, status, note) {
    var costs = [];
    var attachments = [];
    ticket.costList.forEach(element => {
      costs.push({
        name: this.position + ' : ' + this.displayName,
        costValue: element.amount.toString(),
        costDescription: element.note
      })
    });
    ticket.closeAttachments.forEach(element => {
      attachments.push({
        name: this.position + ' : ' + this.displayName,
        attachmentSource: element.url,
        attachmentNote: element.fileName
      })
    });

    var headers = new Headers();
    var json = JSON.stringify(
      {
        ticketStatus: status,
        closeTicketData: {
          note: note,
          closerEmail: this.email,
          closerPosition: this.position,
          closerName: this.displayName,
          attachments: attachments,
          costs: costs
        }
      }
    );
    //console.log(json);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'manager/CloseTicket/' + ticket._id + '/' + ticket.communityId, json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          //console.log(t);
          this.ResolvedDoneShow = !this.ResolvedDoneShow;
        });
  }
  openSnackBar(message: string, action: string) {
    let snackBarRef = this.snackBar.open(message, action, {
      duration: 200000,
    });
    snackBarRef.onAction().subscribe(() => {
      //console.log('The snack-bar action was triggered!');
    });
    snackBarRef.afterDismissed().subscribe(() => {
      //console.log('The snack-bar was dismissed');
    });
  }




  loader(event: Event, type: string) {
    //console.log(event);
    let spinner;
    if (type === 'ok') {
      spinner = document.getElementById('matSpinerOK');
      //console.log('ok')
    } else if (type === 'cancal') {
      spinner = document.getElementById('matSpinerCANCAL');
      //console.log('cancal')
    } else {
      spinner = document.getElementById('matSpinerCANCAL');
      //console.log('else')
    }
    //let oldElement = event.srcElement.firstChild;
    let oldElement = (<HTMLInputElement>event.target).firstChild;
    setTimeout(() => {
      (<HTMLInputElement>event.target).removeChild((<HTMLInputElement>event.target).firstChild);
      this.renderer.removeStyle(spinner, 'display');
      this.renderer.appendChild(event.target, spinner);
    }, 100)
    setTimeout(() => {
      (<HTMLInputElement>event.target).removeChild((<HTMLInputElement>event.target).firstChild);
      this.renderer.setStyle(spinner, 'display', 'none');
      this.renderer.appendChild(event.target, oldElement);
    }, 1000)
  }

  delay(item, functionName) {
    setTimeout(() => {
      switch (functionName) {
        case 'clickMarkAsFix':
          this.clickMarkAsFix(item);
          break;
        case 'vendorRequired':
          this.vendorRequired(item);
          break;
        case 'sendReminderToStaff':
          this.sendReminderToStaff(item);
          break;
        case 'showGetVendorDialog':
          this.showGetVendorDialog(item);
          break;
        case 'showVendorOffersResponses':
          this.showVendorOffersResponses(item);
          break;
        case 'openRatingDialog':
          this.openRatingDialog(item);
          break;
        case 'openResolvedDialog':
          this.openResolvedDialog(item);
          break;
        case 'openDoneDialog':
          this.openDoneDialog(item);
          break;
        case 'sendReminderToJanitor':
          this.sendReminderToJanitor(item);
          break;
        case 'openFixedDialog':
          this.openFixedDialog(item);
          break;
        default:
        // code block

      }
    }, 1111)
  }
  //FAB Speed-Dial
  fabButtons = [
    {
      icon: 'build',
      action: this.onBuild
    },
    // {
    //   icon: 'view_headline'
    // },
    // {
    //   icon: 'room'
    // },
    // {
    //   icon: 'lightbulb_outline'
    // },
    // {
    //   icon: 'lock'
    // }
  ];
  buttons = [];
  fabTogglerState = 'inactive';
  isCostEdit: boolean;
  isShowEdit = false;
  enableEdit = false;

  showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }


  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }
  ////fab

  onBuild() {
    if (this.openTicket) {
      this.openTicket = !this.openTicket;
    } else {
      this.openTicket = true;
    }
    this.subCategory = null;
    this.mainCategory = null;
  }

  addImageToNewTicket(ticket, imageUrl) {
    ticket.files.managementGallery.push(
      {
        uploaderName: this.displayName,
        imageUrl: imageUrl.url,
        fileName: imageUrl.name.split(".")[0],
        fileExt: imageUrl.name.split(".")[1],

        rename: imageUrl.name.split(".")[0],
        edit: false
      });
  }

  renameImageNewTicket(attachmentItem) {
    attachmentItem.fileName = attachmentItem.rename;
    attachmentItem.edit = !attachmentItem.edit
  }

  undoRenameImageNewTicket(attachmentItem) {
    attachmentItem.rename = attachmentItem.fileName;
    attachmentItem.edit = !attachmentItem.edit
  }
  removeImageNewTicket(attachmentItem) {
    this.newTicket.files.managementGallery = this.newTicket.files.managementGallery.filter(item => item !== attachmentItem)
  }

  ticketMainCategory(category) {
    this.subCategory = null;
    this.mainCategory = category;
    (document.querySelector('#mainCategory') as HTMLElement).style.border = 'none';
  }

  openNewTicketNext() {
    const error = this.checkOpemNewTicket();
    this.errorMsg = error;

    if (!error.isError) {
      this.openTicketNext = !this.openTicketNext;
      if (this.newTicket === undefined) {
        this.newTicket = {
          ticketId: 'mit-' + Math.floor((Math.random() * 9999999) + 1000000),
          files: { tenantGallery: [], managementGallery: [] },
          ticketTitle: '',
          ticketSubTitle: '',
          communityId: this.currentComplexKey,
          companyId: this.companyKey,
          ticketDescription: '',
          ticketStatus: "Open",
          ticketOpenerFullname: this.displayName,
          ticketOpenerEmail: this.email,
          ticketOpenerAddress: '',
          ticketOpenerKey: this.key,
          isPetOwner: false,
          isEnteringAllow: false,
          ticketAreaZone: '',
          ticketProfessionalField: '',
          propertyName: this.complex.address
        }
      }
    }
  }

  areaZoneChange() {
    (document.querySelector('#areaZone') as HTMLElement).style.border = 'none';
  }

  subCategoryChange() {
    (document.querySelector('#subCategory') as HTMLElement).style.border = 'none';
  }

  checkOpemNewTicket() {

    if ((this.areaZone === undefined) || (this.areaZone === 'Apartment' && this.unitNumber === null)) {
      (document.querySelector('#areaZone') as HTMLElement).style.border = '1px solid red';
      return { isError: true, message: 'Please fix the errors in the form to continue' };
    }

    if (this.mainCategory === undefined) {
      (document.querySelector('#mainCategory') as HTMLElement).style.border = '1px solid red';
      return { isError: true, message: 'Please fix the errors in the form to continue' };
    }

    if (this.subCategory === null) {
      (document.querySelector('#subCategory') as HTMLElement).style.border = '1px solid red';
      return { isError: true, message: 'Please fix the errors in the form to continue' };
    }

    return { isError: false, message: '' };
  }

  openNewTicket() {
    //location.reload();
    this.newTicket.ticketTitle = this.mainCategory.categoryName;
    this.newTicket.ticketProfessionalField = this.mainCategory.categoryName;
    this.newTicket.ticketSubTitle = this.subCategory;
    this.newTicket.ticketAreaZone = this.areaZone;
    this.newTicket.ticketOpenerAddress = this.unitNumber;

    var headers = new Headers();
    var json = JSON.stringify(this.newTicket);
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.vendorsToken);
    this.http.post(this.vendorServer + 'tenants/addNewTicket', json, { headers: headers })
      .subscribe(
        (res: Response) => {
          const t = res.json();
          console.log(t);
          if (t.message === 'Ticket was created') {
            location.reload();
          }
        });
    this.openTicket = !this.openTicket;
  }

  addTimeFrame() {
    // const date = this.moment().format('DD MMM YY');
    // this.clickedTicket.timeFrame.push({ date: date, am_pm: 'AM' });
    // this.errorMsg = { isError: false, message: '' };
    this.clickedTicket.timeFrame.push({ date: '', am_pm: '' });
    (document.querySelector('#timeFrame') as HTMLElement).style.border = 'none';
    this.errorMsg = { isError: false, message: '' };
  }

  removeTimeFrame(time) {
    this.clickedTicket.timeFrame = this.clickedTicket.timeFrame.filter(item => item !== time);
  }
}

