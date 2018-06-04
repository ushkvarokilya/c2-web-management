import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { loadNotifications } from '../store/notifications/notifications.ac';
import { AppState } from '../store/appState';

@Injectable()
export class NotificationService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	getWebNotifications(fromDate, numberOfDays) {
		let compantState = this.redux.getState().company
		let complexKey = compantState.currentComplex.key;
		return this.http.get(`/complex/${complexKey}/webNotifications/fromDate/${fromDate}/numberOfDays/${numberOfDays}`)
			.catch(err => this.http.commonCatchAndReject(err, 'NotificationService', 'getWebNotifications'))
	}

	initNotifications() {
		this.getNotificationsWraper(moment().valueOf(), 20);
	}

	getNotificationsWraper(fromDate, numberOfDays) {
		this.getWebNotifications(fromDate, numberOfDays)
		.then((data: any) => {
			if (data && data.items) {
				this.redux.dispatch(loadNotifications(data.items));
			} else {
				if(numberOfDays <= 14) this.getNotificationsWraper(fromDate, numberOfDays + 3);
			}
		}, () => {})

	}

}