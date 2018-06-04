import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { AppHttpService } from './shared/http';
import { AppState } from '../store/appState';

@Injectable()
export class TenantService {

  constructor(private http: AppHttpService, private redux: NgRedux<AppState>) { }

  updateTenantEmail(tenantKey, email) {
    return this.http.postPromisified(`/tenant/${tenantKey}/email`, { email })
      .catch(err => this.http.commonCatchAndReject(err, 'TenantService', 'updateTenantEmail'))
  }

  sendInvites(keys) {
    return this.http.putPromisified(`/tenants/passwords`, { keys })
      .catch(err => this.http.commonCatchAndReject(err, 'TenantService', 'sendInvites'))
  }

}
