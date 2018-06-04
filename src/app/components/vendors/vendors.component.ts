import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { Company } from '../../store/company/company.interface';
import { VendorService } from '../../services/vendor.service';
import { AppState } from '../../store/appState';
import { User } from "../../store/user/user.interface";

import { environment } from "../../../environments/environment";


@Component({
  selector: 'app200-vendors-page',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})

export class VendorsPageComponent implements OnInit {

  @select() company$: Observable<Company>;
  @select() user$: Observable<User>;

  vendors = []

  professions = [
    "Genral",
    "Glaziers",
    "Plumbers",
    "Electician",
    "Carpenter",
    "Painter",
    "Gardener",
    "Cables"
  ]

  newVendor
  newVendorErrors;

  mainMessage
  dataLoaded;

  saveVendorError;
  loading;
  searchQuery;
  sortBy;
  show;

  addVendorVisible = false;

  constructor(private vendorService: VendorService, private redux: NgRedux<AppState>, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && !this.dataLoaded) {
        this.loadVendors()
        this.dataLoaded = true;
      }
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.searchQuery) this.searchQuery = params.searchQuery;
      })
    })

    this.initNewVendor()
  }

  private loadVendors() {
    this.mainMessage = "Loading...";
    return this.vendorService.getVendors()
      .then((data: any) => {
        this.vendors = data.vendors
        if (this.vendors && this.vendors.length > 0) delete this.mainMessage
        else this.mainMessage = "No Vendors"
        if (this.vendors) {
          this.vendors.forEach((vendor: any) => {
            vendor.name = vendor.firstName + ' ' + vendor.lastName
          })
        }
        this.professions = data.professions;
      }, err => { })
  }

  getArray(number) {
    let arr = [];
    for (let i = 0; i < number; i++) arr.push(i);
    return arr;
  }

  showAddVendor() {
    this.addVendorVisible = true;
  }

  hideAddVendor() {
    this.addVendorVisible = false;
  }

  getTicketLabel(vendor) {
    let active = 0;
    let closed = 0;
    if (vendor.tickets) {
      vendor.tickets.forEach(ticket => {
        if (ticket.type == 'closed') closed++;
        else if (ticket.type == 'active') active++;
      })
    }
    return `${active} Active Ticket, ${closed} Closed`;
  }

  initNewVendor() {
    this.newVendor = {
      name: "",
      professions: [],
      tmpTextProfession: "",
      address: "",
      phoneNumber: "",
      email: ""
    }
  }

  showEditVendor(vendor) {
    this.newVendor = {
      key: vendor.key,
      name: vendor.name,
      professions: vendor.professions,
      tmpTextProfession: "",
      address: vendor.address,
      phoneNumber: vendor.phoneNumber,
      email: vendor.email
    }
    this.showAddVendor()
  }

  isNewVendorHasProfession(profession) {
    return this.newVendor.professions.findIndex(p => p === profession) !== -1;
  }

  addVendorProfession(event: KeyboardEvent) {
    if (event.keyCode == 188 || event.keyCode == 13) {
      this.newVendor.professions.push(this.newVendor.tmpTextProfession.replace(',', ''));
      this.newVendor.tmpTextProfession = "";
    }
  }

  addProfession(profession) {
    let profIndex = this.professions.indexOf(profession)
    this.newVendor.professions.push(this.professions.splice(profIndex, 1)[0])
    this.forcePipeChangeDetecation()
  }

  removeProfession(profIndex) {
    this.professions.push(this.newVendor.professions.splice(profIndex, 1)[0])
    this.forcePipeChangeDetecation()
  }

  /**
   * change the professions array to force angular to update the view an call the filterUsedProfessions pipe
   * https://angular.io/guide/pipes#pipes-and-change-detection
   */
  private forcePipeChangeDetecation() {
    this.professions = Array.from(this.professions)
  }

  private checkInputs() {
    this.newVendorErrors = {}
    if (this.newVendor.name.length == 0) this.newVendorErrors.name == "Please fill vendor's name"
    else if (this.newVendor.name.split(' ').length < 2) this.newVendorErrors.name = "Please provide first and last name"
    if (this.newVendor.professions.length == 0) this.newVendorErrors.professions == "Please fill vendor's professions"
    if (this.newVendor.email.length == 0) this.newVendorErrors.email == "Please fill vendor's email"
    if (Object.keys(this.newVendorErrors).length == 0) delete this.newVendorErrors;
  }

  saveVendor() {
    this.checkInputs()
    if (this.newVendorErrors) return;
    this.loading = true;
    let vendorToSend = Object.assign({}, this.newVendor);
    delete vendorToSend.addressAutocomplete
    delete vendorToSend.tmpTextProfession
    delete this.saveVendorError;
    let onResolve = () => {
      this.hideAddVendor()
      this.initNewVendor()
      this.loadVendors().then(() => {
        this.loading = false;
      })
    }
    let onReject = err => {
      this.loading = false;
      this.saveVendorError = err;
    }
    if (!vendorToSend.key) {
      this.vendorService.createVendor(vendorToSend)
        .then(onResolve, onReject)
    } else {
      this.vendorService.updateVendorInformation(vendorToSend)
        .then(onResolve, onReject)
    }
  }

  addVendorClosed() {
    this.addVendorVisible = false;
    this.initNewVendor();
    delete this.newVendorErrors
    delete this.saveVendorError
  }

}
