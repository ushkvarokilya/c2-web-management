import { Pipe, PipeTransform } from '@angular/core';
import { select, NgRedux } from "@angular-redux/store";

import { AppState } from "../store/appState";

@Pipe({
  name: 'getTenantByKey'
})

export class GetTenantByKeyPipe implements PipeTransform {

  constructor(private redux: NgRedux<AppState>) {}

  transform(key: any): any {
    let user = this.redux.getState()
      .company.currentComplex
      .tenants.find(t => t.key === key)
    if(user) {
      return `${user.firstName} ${user.lastName}, unit ${user.apartment}`
    }
  }
}