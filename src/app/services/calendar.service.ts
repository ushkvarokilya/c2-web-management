import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';

@Injectable()
export class CalendarService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	addEvent(event) {
		let companyState = this.redux.getState().company;
		let toSendEvent: any = {
			eventField: event.type,
			title: event.name,
			startDate: event.fromDate,
			endDate: event.fullDay ? event.fromDate : event.toDate,
			recurrence: event.repeats
		};
		if (event.fullDay) toSendEvent.allDay = true;
		if (event.repeatUntil !== null && event.repeatUntil !== "") toSendEvent.recurrenceUntil = event.repeatUntil
		return this.http.putPromisified(`/event/complex/${companyState.currentComplex.key}`, toSendEvent)
			.catch(err => this.http.commonCatchAndReject(err, 'CalendarService', 'addEvent'))

	}

	deleteEvent(key, recurrenceMode: 'all' | 'from' = 'all') {
		return this.http.postPromisified(`/event/${key}/delete/${recurrenceMode}`, "")
			.catch(err => this.http.commonCatchAndReject(err, 'CalendarService', 'deleteEvent'));
	}

	editEvent(event) {
		event.startDate = event.fromDate + '';
		event.repeatUntil = event.repeatUntil + '';
		event.endDate = event.toDate + '';
		event.title = event.name;
		event.allDay = event.fullDay;
		// delete event.startDate
		// delete event.endDate
		return this.http.postPromisified(`/event/${event.key}`, event)
			.catch(err => this.http.commonCatchAndReject(err, 'CalendarService', 'editEvent'));
	}

	getComplexEvents() {
		let companyState = this.redux.getState().company;
		let now = moment(new Date());
		let complexKey = companyState.currentComplex.key
		let threeYearsFromNow = moment(now).add(3, 'years');
		return this.http.get(`/complex/${complexKey}/events/start/${now.month() + 1}/${now.year()}/end/${threeYearsFromNow.month() + 1}/${threeYearsFromNow.year()}`)
			.catch(err => this.http.commonCatchAndReject(err, 'CalendarService', 'getComplexEvents'));
	}

}