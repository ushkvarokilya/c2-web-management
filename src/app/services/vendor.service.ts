import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import * as UserActions from '../store/user/user.ac';
import { setComplexes, setCurrentComplex } from '../store/company/company.ac'
import { AppState } from '../store/appState';

@Injectable()
export class VendorService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	createVendor(vendor) {
		let splitName = vendor.name.split(' ')
		vendor.firstName = splitName.splice(0, 1)[0]
		vendor.lastName = splitName.join(' ');
		return this.http.putPromisified('/vendor', vendor)
			.catch(err => this.http.commonCatchAndReject(err, 'VendorService', 'createVendor'))
	}

	getVendors() {
		let companyState = this.redux.getState().company
		let complexKey = companyState.currentComplex.key;
		return this.http.get(`/vendor/complex/${complexKey}`)
			.catch(err => this.http.commonCatchAndReject(err, 'VendorService', 'getVendors'))
	}

	updateVendorInformation(vendor) {
		let splitName = vendor.name.split(' ')
		vendor.firstName = splitName.splice(0, 1)[0]
		vendor.lastName = splitName.join(' ');
		vendor.emails = [vendor.email]
		return this.http.postPromisified(`/vendor/${vendor.key}/info`, vendor)
			.catch(err => this.http.commonCatchAndReject(err, 'VendorService', 'updateVendorInformation'))
	}

}