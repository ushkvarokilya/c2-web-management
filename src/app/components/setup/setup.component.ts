import { Component, OnInit } from '@angular/core';
import * as Rx from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { NgRedux, select } from '@angular-redux/store';
import { AppState } from '../../store/appState';
import { User } from '../../store/user/user.interface';
import { CompanyService } from '../../services/company.service';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { UsersAndRolesComponent, UsersAndRoles } from './users-and-roles/users-and-roles.component';
import { FacilitiesComponent, Facility } from './facilities-details/facilities-details.component';

import { environment } from "../../../environments/environment";

@Component({
	selector: 'app200-setup-company-page',
	templateUrl: './setup.component.html',
	styleUrls: ['./setup.component.scss']
})

export class SetupCompanyPageComponent implements OnInit {

	COMPANYDETAILS = "company details";
	USERSANDROLES = "users and roles";
	FACILITIES = "facilities";

	companyInfo;
	usersAndRoles: UsersAndRoles = {
		locationManagers: [],
		regionalManagers: [],
		staffMembers: []
	};
	facilities;

	companyInfoErrors;
	usersAndRolesErrors;
	facilitiesErrors;

	stage = this.COMPANYDETAILS;

	progressBarPosition;

	doNextObservable: Subject<string>;

	switchTo;

	loading;
	loadingError;

	error;

	constructor(private redux: NgRedux<AppState>, private companyService: CompanyService, private router: Router, private activatedRoute: ActivatedRoute) {
		this.doNextObservable = new Rx.Subject<string>();
	}

	ngOnInit() {

		this.activatedRoute.queryParams.subscribe((params: any) => {
			if (params.stage) this.stage = params.stage
			else this.stage = this.COMPANYDETAILS
		})

		if (this.stage == this.COMPANYDETAILS) this.progressBarPosition = "83%";
		else if (this.stage == this.USERSANDROLES) this.progressBarPosition = "50%";
		else if (this.stage == this.FACILITIES) this.progressBarPosition = "16%";
	}

	nextClicked() {
		this.doNextObservable.next(this.stage);
	}

	doneNext(event) {
		let user = this.redux.getState().user;
		let reject = () => {
			this.loading = false;
			this.loadingError = "Error communicating with the server"
		}
		this.loadingError = "";
		switch (this.stage) {
			case this.COMPANYDETAILS:
				this.companyInfo = event.data;
				this.companyInfoErrors = event.errors;
				if (this.companyInfoErrors) {
					this.loadingError += "Notice the errors above"
				} else if (!this.companyInfo) {
					this.loadingError += "Please fill Company Details"
				} else {
					this.loading = true;
					this.companyService.updateCompanyInfo(user.companyKey, this.companyInfo)
						.then(_ => {
							this.loading = false
							delete this.loadingError
							this.switchStages(this.switchTo ? this.switchTo : this.USERSANDROLES)
						}, reject)
				}
				break;
			case this.USERSANDROLES:
				// this.usersAndRoles = event.users;
				if (event.errors) {
					if (event.data) this.loadingError = event.data
					else this.loadingError += this.loadingError.length > 0 ? " & " : "" + "Notice the errors above"
					this.loading = false
				} else if (event.loading) {
					this.loading = true
				} else {
					this.loading = false
					this.usersAndRoles = event.users
					this.switchStages(this.switchTo ? this.switchTo : this.FACILITIES)
				}
				break;
			case this.FACILITIES:
				this.facilitiesErrors = event.errors;
				this.facilities = event.facilities;
				if (this.facilitiesErrors) {
					this.loading = false
					this.loadingError += this.loadingError.length > 0 ? " & " : "" + "Notice the errors above"
				} else {
					this.loading = true;
					this.companyService.createCompanyFacilities(user.companyKey, this.facilities)
						.then(_ => {
							this.loading = false
							delete this.loadingError
							this.switchStages(this.switchTo ? this.switchTo : undefined)
						}, reject)
				}
		}
	}

	// sendDataParallel() {
	// 	let user = this.redux.getState().user;

	// 	let finishedNum = 0;
	// 	this.loading = true;
	// 	let resolve = () => {
	// 		finishedNum++;
	// 		if (finishedNum == 3) {
	// 			this.loading = false;
	// 			location.replace('/')
	// 		}
	// 	}
	// 	let reject = () => {
	// 		this.loading = false;
	// 		this.loadingError = "Error communicating with the server"
	// 	}
	// 	this.companyService.updateCompanyInfo(user.companyKey, this.companyInfo).then(resolve, reject)
	// 	this.companyService.addCompanyUsers(user.key, this.usersAndRoles).then(resolve, reject)
	// 	this.companyService.addCompanyFacilities(user.companyKey, this.facilities).then(resolve, reject)
	// }
	setUsers(data) {
		this.usersAndRoles = data.users
	}

	previous() {
		switch (this.stage) {
			case this.USERSANDROLES:
				this.switchStages(this.COMPANYDETAILS)
				break;
			case this.FACILITIES:
				this.switchStages(this.USERSANDROLES)
				break;
		}
	}

	switchStages(toStage) {
		if (!toStage) {
			location.replace('/')
			return
		}
		let animationTime = 300;
		document.getElementById('stageHolder').className += ' fadeout';
		setTimeout(() => {
			this.stage = toStage;
			document.getElementById('stageHolder').className = document.getElementById('stageHolder').className.replace('fadeout', 'fadein');
			if (this.stage == this.COMPANYDETAILS) this.progressBarPosition = "83%";
			else if (this.stage == this.USERSANDROLES) this.progressBarPosition = "50%";
			else if (this.stage == this.FACILITIES) this.progressBarPosition = "16%";
			setTimeout(() => {
				document.getElementById('stageHolder').className = 'stage-holder';
			}, animationTime)
		}, animationTime)
		delete this.switchTo;
	}

}
