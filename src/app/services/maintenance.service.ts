import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';

@Injectable()
export class MaintenanceService {


	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	getComlexKey() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key
		return complexKey
	}

	getManagementMaintananceTickets() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key
		return this.http.get(`/complex/${complexKey}/tickets`)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'getManagementMaintananceTickets'))
	}

	updateEstimateTime(ticket) {
		return this.http.putPromisified(`/maintenance/ticket/${ticket.key}`, ticket)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'updateEstimateTime'))
	}

	mergeTickets(dominantKey, additionalKeys) {
		return this.http.postPromisified(`/merge`, { dominantKey, additionalKeys })
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'mergeTickets'))
	}

	updateMaintenanceTicket(ticketKey, data: { moreInfo?: any, photoUrl?: string, estimateDate?: string, status?: string }) {
		return this.http.postPromisified(`/maintenance/ticket/${ticketKey}`, data)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'updateMaintenanceTicket'))
	}

	sendVendorOffers(ticketKey, offers) {
		return this.http.postPromisified(`/ticket/offers/${ticketKey}`, offers)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'sendVendorOffers'))
	}

	sendReminderToJanitor(ticketKey) {
		return this.http.postPromisified(`/maintenance/ticket/${ticketKey}/janitor`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'sendReminderToJanitor'))
	}

	seperateTicket(ticketKey) {
		return this.http.postPromisified(`/ticket/${ticketKey}/separateTickets`, {})
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'seperateTicket'))
	}

	sendToVendor(ticketKey, managerKey, vendorKeys?: Array<string>, startDate?: string, endDate?: string, deadline?: string) {
		let data: any = {};
		if (startDate !== undefined) {
			data.startDate = startDate;
		}
		if (endDate !== undefined) {
			data.endDate = endDate;
		}
		if (deadline !== undefined) {
			data.deadline = deadline;
		}
		if (vendorKeys !== undefined) {
			data.vendorKeys = vendorKeys;
		}
		return this.http.putPromisified(`/ticket/${ticketKey}/vendors/manager/${managerKey}`, data)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'sendToVendor'))
	}

	getCardOffers(ticketKey) {
		let data = {};
		return this.http.postPromisified(`/ticket/${ticketKey}/offer/original`, data)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'getCardOffers'))
	}

	rateTicket(ticketKey, rating) {
		let data = {};
		return this.http.postPromisified(`/rate/ticket/${ticketKey}/rating/${rating}`, data)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'rateTicket'))
	}

	getVendorOfferResponse(ticketKey) {
		return this.http.get(`/offer/ticket/${ticketKey}`)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'getVendorOfferResponse'))
	}

	assignVendor(offerKey){
		return this.http.postPromisified(`/offer/${offerKey}/assign`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'assignVendor'))
	}

	sendFixProblemResolve(ticketKey, data: { lastStatusChanged?: any, status?: string }) {
		return this.http.postPromisified(`/maintenance/ticket/${ticketKey}`, data)
			.catch(err => this.http.commonCatchAndReject(err, 'MaintenanceService', 'sendFixProblemResolve'))
	}

	// updateMaintenanceTicket
}