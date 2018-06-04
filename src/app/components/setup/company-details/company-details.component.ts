import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Subject, Observable, Subscription } from 'rxjs';
import { User } from '../../../store/user/user.interface';
import { Company } from '../../../store/company/company.interface';
import { AppState } from '../../../store/appState';
import { CompanyService } from '../../../services/company.service';
import { OpeningHour, ActivityMode } from "../shared/opening-hours/opening-hours.component";
import { GoogleAddress } from "../../shared/google-address/google-address.component";

import { environment } from "../../../../environments/environment";

import * as moment from 'moment'
import { StringValidationService } from '../../../services/string-validation.service';
import { filter, takeWhile } from 'rxjs/operators';

@Component({
	selector: 'app200-company-details',
	templateUrl: './company-details.component.html',
	styleUrls: ['./company-details.component.scss']
})

export class CompanyDetailsComponent implements OnInit {

	@Input() doNext: Subject<string>;
	@Input() nextName: string;
	@Input() googleMapsLoadObservable: Subject<boolean>;
	@Output() doneNext = new EventEmitter();

	@select() user$: Observable<User>;
	@select() company$: Observable<Company>

	userSubscription: Subscription;

	name: string;
	logoImg: File;
	address: GoogleAddress = {
		latitude: 0,
		longitude: 0,
		address: ""
	}
	phoneNumbers: string[] = [""];
	emails: string[] = [""]

	REMOVE = "remove";
	APPEND = "append";
	latestPhoneNumberAction;
	latestEmailAction;

	logoImgLocalUrl: string;
	loadingImage = false;
	imgBarRight = 100;

	activityMode = ActivityMode.weeklySchedule
	activityDays: OpeningHour[]

	errors: any;

	constructor(
		private redux: NgRedux<AppState>,
		private companyService: CompanyService,
		private stringValidation: StringValidationService
	) {
		this.errors = {};
	}

	ngOnInit() {

		this.getCompanyDetails()

		this.doNext.subscribe(value => {
			if (value == this.nextName) this.next();
		})

	}

	private getCompanyDetails() {
		let dataFromServerFetched = false
		this.user$
			.pipe(
				filter(user => user.token !== null),
				takeWhile(_ => !dataFromServerFetched)
			)
			.subscribe(user => {
				dataFromServerFetched = true
				this.companyService.getCompanyInfo(user.companyKey)
					.then((companyInfo: any) => {
						this.mapServerData(companyInfo)
					}, err => {
					})
			})
	}

	private mapServerData(companyInfo) {
		this.name = companyInfo.name || '';
		this.logoImg = companyInfo.imageUrl || '';
		this.activityMode = companyInfo.activityMode
		this.activityDays = companyInfo.activityDays
		if (companyInfo.imageUrl && companyInfo.imageUrl.length > 0) this.logoImgLocalUrl = companyInfo.imageUrl;
		if (companyInfo.address) {
			this.address = {
				address: companyInfo.address,
				latitude: 0,
				longitude: 0
			};
		}
		if (companyInfo.phoneNumbers && Array.isArray(companyInfo.phoneNumbers) && companyInfo.phoneNumbers) {
			this.phoneNumbers = companyInfo.phoneNumbers
		}
		if (companyInfo.emails && Array.isArray(companyInfo.emails) && companyInfo.emails) {
			this.emails = companyInfo.emails
		}
	}


	imgChangeEvent(event) {
		let picture = <File>event.currentTarget.files[0];
		if (typeof picture == 'undefined') {
			return;
		}
		if (!this.stringValidation.isImageMimeType(picture.type) || picture.size > 5000000) {
			return;
		} else {
			this.logoImg = picture;
			let reader = new FileReader();
			reader.onload = (e) => {
				this.logoImgLocalUrl = reader.result;
			}
			reader.readAsDataURL(picture);
		}
	}

	removeLogoImg() {
		delete this.logoImg;
		delete this.logoImgLocalUrl;
	}

	appendPhoneNumber() {
		this.phoneNumbers.push("");
		this.latestPhoneNumberAction = this.APPEND;
	}

	removePhoneNumber(index) {
		this.phoneNumbers.splice(index, 1);
		this.latestPhoneNumberAction = this.REMOVE;
		if (this.errors.phoneNumbers) {
			delete this.errors.phoneNumbers[index];
			if (Object.keys(this.errors.phoneNumbers).length == 0) delete this.errors.phoneNumbers;
		}
	}

	appendEmail() {
		this.emails.push('');
		this.latestEmailAction = this.APPEND;
	}

	removeEmail(index) {
		this.emails.splice(index, 1);
		this.latestEmailAction = this.REMOVE;
		if (this.errors.emails) {
			delete this.errors.emails[index];
			if (Object.keys(this.errors.emails).length == 0) delete this.errors.emails;
		}
	}

	next() {
		this.errors = {};

		this.checkName();
		this.checkAddress();
		this.checkPhoneNumbers();
		this.checkEmails();
		if (Object.keys(this.errors).length > 0) {
			this.doneNext.emit({
				errors: true
			});
		} else {
			let emails = Array.prototype.filter.call(document.getElementsByClassName('company-details-email-input'), (testElement) => testElement).map(emailInput => emailInput.value);
			let phoneNumbers = Array.prototype.filter.call(document.getElementsByClassName('company-details-phone-number-input'), (testElement) => testElement).map(phoneInput => phoneInput.value);
			this.doneNext.emit({
				data: {
					name: this.name,
					imageUrl: this.logoImg,
					address: this.address.address,
					phoneNumbers,
					emails,
					activityMode: this.activityMode,
					activityDays: this.activityDays
				}
			});
		}
	}

	checkName() {
		//check if name is empty
		if (!this.name || this.name.length == 0) {
			this.errors.name = "Please fill the company's name";
		}
	}

	checkAddress() {
		if (!this.address || !this.address.address || this.address.address.length == 0) {
			this.errors.address = "Please fill the company's address";
		}
	}

	checkPhoneNumbers() {
		//check if all phones are ok
		let phoneNumbersInputs = Array.prototype.filter.call(document.getElementsByClassName('company-details-phone-number-input'), (testElement) => testElement);
		for (let index in phoneNumbersInputs) {
			let phone = phoneNumbersInputs[index].value;
			if (phone == "") {
				if (!this.errors.phoneNumbers) this.errors.phoneNumbers = {};
				this.errors.phoneNumbers[index] = "Please fill this number"
			}
		}
	}

	checkEmails() {
		//check if all emails are ok
		let emailInputs = Array.prototype.filter.call(document.getElementsByClassName('company-details-email-input'), (testElement) => testElement);
		for (let index in emailInputs) {
			let email = emailInputs[index].value;
			if (email == "") {
				if (!this.errors.emails) this.errors.emails = {};
				this.errors.emails[index] = "Please fill this email";
			} else if (!this.stringValidation.isValidEmail(email)) {
				if (!this.errors.emails) this.errors.emails = {};
				this.errors.emails[index] = "This isn't a valid email address";
			}
		}
	}

}
