import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';
import * as CompanyActions from '../store/company/company.ac';
import { l } from '@angular/core/src/render3';
import { environment } from "../../environments/environment";

@Injectable()
export class CompanyService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	// getDetails() {
	// 	let companyKey = this.redux.getState().user.companyKey;
	// 	this.getCompanyInfo(companyKey)
	// 		.then((data: any) => {
	// 			this.redux.dispatch(CompanyActions.setNameAndImage(data.name, data.imageUrl))
	// 			return Promise.resolve();
	// 		})
	// 		.catch(err => {
	// 		})
	// }

	getDetails() {
		let user = this.redux.getState().user;
		return new Promise((resolve, reject) => {
			let xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = () => {
				if (xmlHttp.readyState == XMLHttpRequest.DONE) {
					if (xmlHttp.status >= 200 && xmlHttp.status <= 204) {
						let jsonText = xmlHttp.responseText;
						if (jsonText && typeof jsonText == 'string' && jsonText.length > 0) resolve(JSON.parse(jsonText))
						else resolve(jsonText);
					} else {
						reject({ status: xmlHttp.status, message: xmlHttp.responseText })
					}
				}
			}
			xmlHttp.open("GET", environment.accounting_api_endpoint + 'Company/' + user.companyKey + '/NameAndImage', true);
			xmlHttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
			xmlHttp.setRequestHeader('Authorization', 'Bearer ' + user.token);
			xmlHttp.send();
		}).then((data: any) => {
			this.redux.dispatch(CompanyActions.setNameAndImage(data.name, data.imageUrl))
			return Promise.resolve();
		}).catch(err => this.http.commonCatchAndReject(err, 'CompanyService', 'getDetails'));
	}

	getComplexes() {
		let companyKey = this.redux.getState().user.companyKey;
		return this.http.get(`/company/${companyKey}/complex`)
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'getComplexes'))
			.then((data: any) => {
				if (data.items) {
					this.redux.dispatch(CompanyActions.setComplexes(data.items));
				}
				return Promise.resolve(data.items);
			}), Promise.reject
	}

	getComplexesDetailed(companyKey) {
		return this.http.get(`/company/${companyKey}/complex/details`)
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'getComplexesDetailed'))
	}

	getCompanyInfo(companyKey) {
		return this.http.get(`/company/${companyKey}`)
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'getCompanyInfo'))
	}

	updateCompanyInfo(companyKey: string, info: { name: string, imageUrl?: string, address: string, phoneNumbers: string[], emails: string[] }) {
		return this.http.postPromisified(`/company/${companyKey}`, info)
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'updateCompanyInfo'))
	}

	addCompanyUsers(users: { forename: string, surname: string, admin: boolean, email: string, viewing: string[], actions: string[], position: string }[]) {
		return this.http.putPromisified(`/company/users/${this.redux.getState().user.key}`, { managementCreations: users })
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'addCompanyUsers'))
	}

	getCompanyUsers(companyKey) {
		return this.http.get(`/company/${companyKey}/users`)
			.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'getCompanyUsers'))
	}

	createCompanyFacilities(companyKey, facilities) {
		if (facilities.length === 0) return Promise.resolve()
		else {
			return this.http.putPromisified(`/company/${companyKey}/facilities`, { facilities })
				.catch((err) => this.http.commonCatchAndReject(err, 'CompanyService', 'createCompanyFacilities'))
		}
	}

}