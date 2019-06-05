import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import * as UserActions from '../store/user/user.ac';
import { setComplexes, setCurrentComplex } from '../store/company/company.ac'
import { AppState } from '../store/appState';
import * as CompanyActions from '../store/company/company.ac';

import { environment } from "../../environments/environment";


@Injectable()
export class UserService {
	environment = environment;
	private headers: Headers;

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>, private httpTEST: Http) {
		this.headers = new Headers({ 'Content-Type': 'application/json' });
	}

	initUser(): Promise<any> {
		let userBridge = localStorage.getItem('user_bridge')
		let user = this.redux.getState().user;
		if (userBridge && userBridge.length > 0) {
			userBridge = JSON.parse(userBridge)
			return this.getManagerProfile(userBridge)
		} else if (user.token !== null && user.key !== null) {
			return this.getManagerProfile(user)
		} else {
			return Promise.reject({ noUser: true })
		}
	}

	setNewToken(token) {
		let userBridge = JSON.parse(localStorage.getItem('user_bridge'))
		userBridge.token = token
		localStorage.setItem('user_bridge', JSON.stringify(userBridge))
		this.redux.dispatch(UserActions.setToken(token))
	}

	// private getManagerProfile(user) {
	// 	return this.http.get(`/manager/${user.key}`, { 'Authorization': 'Bearer ' + user.token })
	// 		.then((data: any) => {
	// 			localStorage.setItem('user_details', JSON.stringify({ email: data.email, firstName: data.firstName, lastName: data.lastName, position:data.position }));
	// 			this.redux.dispatch(UserActions.loggedin(user.token, data.companyKey, user.key, data.position, data.firstName, data.lastName, data.email, data.photoUrl, data.viewPermissions, data.actionPermissions, data.isJanitor, data.isLocationManager, data.isRegionalManager));
	// 			this.redux.dispatch(CompanyActions.setComplexes(data.complexes));
	// 			if (data.complexes) {
	// 				let complexIndex = this.redux.getState().company.complexes.findIndex(c => c.key == this.redux.getState().user.currentComplexKey);
	// 				if (complexIndex === -1) complexIndex = 0;
	// 				this.redux.dispatch(CompanyActions.setCurrentComplex(complexIndex));
	// 			}
	// 			return Promise.resolve(data.complexes);
	// 		})
	// 		.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'getManagerProfile'))
	// }

	private getManagerProfile(user) {
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
			xmlHttp.open("GET", this.environment.accounting_api_endpoint + 'UserData/' + user.key + '/manager', true);
			xmlHttp.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
			xmlHttp.setRequestHeader('Authorization', 'Bearer ' + user.token);
			xmlHttp.send();
		}).then((data: any) => {
			console.log(data);
			localStorage.setItem('user_details', JSON.stringify({ email: data.email, firstName: data.firstName, lastName: data.lastName, position: data.position, companyKey: data.companyId}));
			this.redux.dispatch(UserActions.loggedin(user.token, data.companyId, user.key, data.position, data.firstName, data.lastName, data.email, data.photoUrl, data.viewPermissions, data.actionPermissions, data.isJanitor, data.isLocationManager, data.isRegionalManager));
			this.redux.dispatch(CompanyActions.setComplexes(data.properties));
			if (data.properties) {
				let complexIndex = this.redux.getState().company.complexes.findIndex(c => c.key == this.redux.getState().user.currentComplexKey);
				if (complexIndex === -1) complexIndex = 0;
				this.redux.dispatch(CompanyActions.setCurrentComplex(complexIndex));
			}
			return Promise.resolve(data.properties);
		}).catch(err => this.http.commonCatchAndReject(err, 'UserService', 'getManagerProfile'));
	}

	login(email, password) {
		return this.http.postPromisified('/auth/login/manager', { email, password })
	}

	managerChangeEmail(email) {
		let userKey = this.redux.getState().user.key
		return this.http.postPromisified(`/company/manager/${userKey}/email`, { email })
			.then(_ => {
				this.redux.dispatch(UserActions.setEmail(email))
			})
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'managerChangeEmail'))
	}

	changePassword(oldPassword, newPassword) {
		let userKey = this.redux.getState().user.key
		return this.http.postPromisified(`/company/manager/${userKey}/password`, { oldPassword, newPassword })
			.then(data => {
				this.setNewToken(data.token)
			})
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'changePassword'))
	}

	signout() {
		this.redux.dispatch(UserActions.logout())
		this.redux.select((appState: AppState) => appState.user)
			.subscribe(user => {
				if (user.token == null) {
					localStorage.removeItem('user_bridge')
					localStorage.removeItem('user_details')
					window.location.replace(environment.commercialPageDomain);
				}
			})
	}

	sendResetPasswordEmail(email) {
		return this.http.postPromisified(`/auth/forget/manager`, { email })
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'sendResetPasswordEmail'))
	}

	resetPasswordWithToken(token, password, isManager = true) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			"Authorization": "Bearer " + token
		})
		let temp = isManager ? 'manager' : 'tenant';
		return this.http.postPromisified(`/auth/reset/${temp}`, { password }, headers)
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'resetPasswordWithToken'))
	}


	resetTenantPassword(password) {
		return this.http.postPromisified(`/auth/reset/manager`, { password })
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'resetTenantPassword'))
	}
}