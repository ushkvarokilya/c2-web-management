import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AppState } from '../../../store/appState';
import { Company } from '../../../store/company/company.interface';
import { MessagingService } from '../../../services/messaging.service';
import { ComplexService } from '../../../services/complex.service'
import { TenantService } from "../../../services/tenant.service";
import * as Moment from 'moment';
import { User } from "../../../store/user/user.interface";

import { environment } from "../../../../environments/environment";
import { StringValidationService } from '../../../services/string-validation.service';

@Component({
  selector: 'tenants-view',
  templateUrl: './tenants-view.component.html',
  styleUrls: ['./tenants-view.component.scss']
})

export class TenantsViewComponent implements OnInit, OnDestroy {

  @Input() searchQuery: string
  @Output() addTenants = new EventEmitter<boolean>()
  @Output() setAptNumLabel = new EventEmitter<string>()
  @Output() editableLease: EventEmitter<any> = new EventEmitter<any>()

  @select() company$: Observable<Company>
  @select() user$: Observable<User>

  mutationObs: MutationObserver

  leases

  dataLoaded

  sortBy = "apartment"
  show = "all"

  moment

  errorInEmail = '';

  mainMessage

  loadingNote

  environment = environment

  amenities = [
    { name: "air_conditioning", image: '/assets/img/air_condition.png' },
    { name: "cabels", image: '/assets/img/cables.png' },
    { name: "balcony", image: '/assets/img/balcony.png' },
    { name: "heating", image: '/assets/img/heating.png' },
    { name: "accessibility", image: '/assets/img/accessabily.png' },
    { name: "water_heater", image: '/assets/img/water_heater.png' },
    { name: "washing_machine", image: '/assets/img/washing_machine.png' },
    { name: "hot_tub", image: '/assets/img/hot_tub.png' },
    { name: "cooking_gas", image: '/assets/img/cooking_icon.png' },
    { name: "drayer", image: '/assets/img/dryer.png' }]

  sendingInvites = false

  tempEmailForEditWindow;

  constructor(private complexService: ComplexService,
    private messagesService: MessagingService,
    private redux: NgRedux<AppState>,
    private router: Router,
    private tenantService: TenantService,
    private stringValidation: StringValidationService
  ) {
    this.moment = Moment;
  }

  ngOnInit() {

    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && !this.dataLoaded) {
        this.mainMessage = "Loading..."

        // this.complexService.getFacilityOverview()
        // 	.then((_) => {})
        // 	.catch(e => e)
        // this.dataLoaded = true;

        this.complexService.getAllApartmentLeasesFromComplex()
          .then((data: any) => {
            if (data.leases) {

              this.leases = data.leases.map(lease => {
                if (!lease.paymentScore) lease.paymentScore = 100;
                if (!lease.rent) lease.rent = 0;
                lease.ticketsNum = 0
                lease.tenants.forEach(tenant => {
                  if (!tenant.ticketKeys) tenant.ticketKeys = [];
                  if (!tenant.paymentScore) tenant.paymentScore = 100;
                  if (!tenant.notes) tenant.notes = []
                  if(tenant.phoneNumber && tenant.phoneNumber.length === 10){
                    let section1 = tenant.phoneNumber.substring(0,3)
                    let section2 = tenant.phoneNumber.substring(3,6)
                    let section3 = tenant.phoneNumber.substring(6)
                    tenant.phoneNumber = '(' + section1 + ')' + ' ' + section2 + '-' + section3
                  }
                  // lease.rent += tenant.partInRent;
                  lease.ticketsNum += tenant.ticketKeys.length
                  if (!lease.scannedLeaseUrl || !this.stringValidation.isValidUrl(lease.scannedLeaseUrl)) {
                    lease.scannedLeaseUrl = false
                  }
                })
                if (lease.unit && lease.unit.amenities) {
                  let amenities = {};
                  for (let a of lease.unit.amenities) amenities[a] = true;
                  lease.unit.amenities = amenities;
                }
                return lease;
              });
              delete this.mainMessage;
            } else this.mainMessage = "No Leases"

            this.setAptNumLabel.emit(`${data.occupied} / ${data.total}`)

            let config = { attributes: true, childList: true, characterData: true };

          }, err => {
          })
        this.dataLoaded = true;
      }
    })

  }

  ngOnDestroy() {
    if (this.mutationObs) this.mutationObs.disconnect()
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

  navigateToChatWithGroup(tenants, apartment) {
    let participants = tenants.map(tenant => ({
      key: tenant.key,
      name: tenant.firstName + ' ' + tenant.lastName,
      imageUrl: tenant.imageUrl,
      apartment
    }))
    this.messagesService.newGroup(participants)
    this.router.navigate(['/messaging'])
  }

  getPresentableDate(date) {
    return Moment(+date).format("DD MMM YYYY")
  }

  seeScanedLease(leaseIndex) {
    this.leases[leaseIndex].showScannedLease = true;
    if (this.leases[leaseIndex].scannedLeaseUrl) {
      setTimeout(() => {
        let iframe = <HTMLIFrameElement>document.getElementById('scannedLease' + leaseIndex).getElementsByTagName('iframe')[0]
        iframe.src = this.leases[leaseIndex].scannedLeaseUrl
      }, 400)
    }
  }

  saveNote(tenant) {
    this.loadingNote = true
    let note: any = {
      note: tenant.tmpNote,
      publishDate: Date.now() + '',
      managerKey: this.redux.getState().user.key
    }
    let onPromiseFinish = (() => {
      this.loadingNote = false
      delete tenant.previousPublishDate
      delete tenant.tmpNote
    }).bind(this)
    if (tenant.previousPublishDate) {
      note.previousPublishDate = tenant.previousPublishDate
      this.complexService.editTenantNote(tenant.key, note)
        .then(onPromiseFinish, onPromiseFinish)
        .then(_ => {
          let noteIndex = tenant.notes.findIndex(n => n.publishDate === note.previousPublishDate)
          note.managerName = this.redux.getState().user.firstName + " " + this.redux.getState().user.lastName
          tenant.notes[noteIndex] = note
        })
    } else {
      this.complexService.addTenantNote(tenant.key, note)
        .then(onPromiseFinish, onPromiseFinish)
        .then(_ => {
          note.managerName = this.redux.getState().user.firstName + " " + this.redux.getState().user.lastName
          tenant.notes.push(note)
        })
    }
  }

  editNote(tenant, noteBody, notePublishDate) {
    tenant.tmpNote = noteBody
    tenant.previousPublishDate = notePublishDate
  }

  deleteNote(tenant, notePublishDate) {
    this.complexService.deleteTenantNote(tenant.key, notePublishDate)
      .then(_ => {
        let noteIndex = tenant.notes.findIndex(n => n.publishDate === notePublishDate)
        tenant.notes.splice(noteIndex, 1)
      }, _ => { })
  }

  sendToEdit(lease) {
    this.editableLease.emit(lease);
  }

  renderAmenityName(name) {
    return name.split('_').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
  }

  async updateTenatEmail(tenant) {
    tenant.updating = true
    try {
      await this.tenantService.updateTenantEmail(tenant.key, this.tempEmailForEditWindow)
      tenant.email = this.tempEmailForEditWindow;
    } catch (err) {
      this.errorInEmail = err.message;
      tenant.updating = false
      return
    }
    tenant.showEditInfo = false
    tenant.updating = false
  }

  openUserData(tenant) {
    this.tempEmailForEditWindow = tenant.email;
  }

  sendInvites() {
    let keys = []
    this.leases.forEach(lease => {
      lease.tenants.forEach(tenant => {
        if (tenant.email && this.stringValidation.isValidEmail(tenant.email)) {
          keys.push(tenant.key)
        }
      })
    })
    if (keys.length > 0) {
      this.sendingInvites = true
      this.tenantService.sendInvites(keys)
        .then(_ => {
          this.sendingInvites = false
        })
    }
  }

  sendInvite(tenant) {
    tenant.sendingInvite = true
    this.tenantService.sendInvites([tenant.key])
      .then(_ => {
        tenant.sendingInvite = false
      })
  }

  canShowTenantInviteButton(tenant) {
    if (tenant && tenant.email) {
      return this.stringValidation.isValidEmail(tenant.email)
    }
  }
}
