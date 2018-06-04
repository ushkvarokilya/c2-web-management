import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import * as UserActions from '../store/user/user.ac';
import { setComplexes, setCurrentComplex } from '../store/company/company.ac'
import { AppState } from '../store/appState';
import * as CompanyActions from '../store/company/company.ac';

import { environment } from "../../environments/environment";

@Injectable()
export class UserService {

	private headers: Headers;

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
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

	private getManagerProfile(user) {
		return this.http.get(`/manager/${user.key}`, { 'Authorization': 'Bearer ' + user.token })
			.then((data: any) => {
				this.redux.dispatch(UserActions.loggedin(user.token, data.companyKey, user.key, data.position, data.firstName, data.lastName, data.email, data.photoUrl, data.viewPermissions, data.actionPermissions, data.isJanitor, data.isLocationManager, data.isRegionalManager));
				this.redux.dispatch(CompanyActions.setComplexes(data.complexes));
				if (data.complexes) {
					let complexIndex = this.redux.getState().company.complexes.findIndex(c => c.key == this.redux.getState().user.currentComplexKey);
					if (complexIndex === -1) complexIndex = 0;
					this.redux.dispatch(CompanyActions.setCurrentComplex(complexIndex));
				}
				return Promise.resolve(data.complexes);
			})
			.catch(err => this.http.commonCatchAndReject(err, 'UserService', 'getManagerProfile'))
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