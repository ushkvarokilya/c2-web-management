import { Pipe, PipeTransform } from '@angular/core';
import { select, NgRedux } from "@angular-redux/store";

import { AppState } from "../store/appState";
import { Tenant } from '../store/company/company.interface';

@Pipe({
  name: 'showInviteesReservation'
})

export class ShowInviteesReservationPipe implements PipeTransform {

  constructor(private redux: NgRedux<AppState>) { }

  transform(inviteesKeys: string[], tenants: Tenant[]): any {
    let currentComplexTenants = tenants
    if (!inviteesKeys || !Array.isArray(inviteesKeys) || inviteesKeys.length == 0 || !currentComplexTenants) {
      return inviteesKeys
    }
    return inviteesKeys.map(k => {
      let tenant = currentComplexTenants.find(t => t.key === k)
      return `${tenant.firstName} ${tenant.lastName}, unit ${tenant.apartment}`
    }).join(', ')

  }
}