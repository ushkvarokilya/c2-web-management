import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, SimpleChanges } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as Moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Company } from '../../../store/company/company.interface';
import { AppState } from '../../../store/appState';
import { ComplexService } from '../../../services/complex.service'

import { environment } from "../../../../environments/environment";
import { StringValidationService } from '../../../services/string-validation.service';



@Component({
	selector: 'add-tenant',
	templateUrl: './add-tenant.component.html',
	styleUrls: ['./add-tenant.component.scss'],
	providers: [ComplexService]
})
export class AddTenantComponent implements OnInit {

	@Output() close = new EventEmitter<any>();
	@select() company$;
	@Input() editableLease;

	private _data = new BehaviorSubject<any>([]);

	apartments = [];

	apartmentKey;
	apartmentName;

	startDay;
	endDay;

	monthDays;
	moment;
	editable;
	form = {
		startDate: null,
		endDate: null,
		autoRenew: null,
		splitPayment: false,
		dueDate: null,
		leaseUrl: null,
		payments: [{
			monthlyChargeName: "rent",
			monthlyChargeAmount: null
		}, {
			monthlyChargeName: "parking",
			monthlyChargeAmount: null
		}],
		tenants: [{
			firstName: "",
			lastName: "",
			email: "",
			entranceDate: null,
			phoneNumbers: [""],
			rentPercantage: 100,
			birthDateHolder: null,
			birthDate: null
		}]
	}

	dataLoaded;

	errors: any = {};

	loading;

	constructor(
		private complexService: ComplexService, 
		private redux: NgRedux<AppState>,
		private stringValidation: StringValidationService
	) { }
	ngOnInit() {

		this.moment = Moment;
		this.monthDays = [];
		for (let i = 1; i <= 28; i++) this.monthDays.push(i);
		this.company$.subscribe((company: Company) => {
			if (company.currentComplex !== null && !this.dataLoaded) {
				this.complexService.getUnassignedApartments(company.currentComplex.key)
					.then((data: any) => {

						this.apartments = data.items.map(a => ({
							name: a.floor + a.number,
							key: a.key
						})).sort((a, b) => {
							if (a.name > b.name) return 1;
							else if (a.name < b.name) return -1;
							else return 0;
						});

					}, err => {
						console.error('error while getUnassignedApartments', err);
					})
			}
		});
		if (this.editableLease) {
			this.apartmentName = this.editableLease.apartment;
			for (let tenant of this.editableLease.tenants) {
				this.form.tenants.push({
					firstName: tenant.firstName,
					lastName: tenant.lastName,
					email: tenant.eMail,
					entranceDate: null,
					phoneNumbers: [""],
					rentPercantage: tenant.partInRent,
					birthDateHolder: null,
					birthDate: null
				});
			}
		}
	}

	openChooseFile() {
		(<HTMLInputElement>document.getElementsByClassName('cloudinary_fileupload')[0]).click();
	}

	appendMonthlyCharge() {
		this.form.payments.push({
			monthlyChargeName: "",
			monthlyChargeAmount: ""
		})
	}

	changePayResType(tenant) {
		if (tenant.rentPercantage == 0) tenant.rentPercantage = 10;
		else tenant.rentPercantage = 0;
	}

	appendTenant() {
		this.form.tenants.push({
			firstName: null,
			lastName: null,
			email: null,
			entranceDate: null,
			phoneNumbers: [null],
			rentPercantage: 10,
			birthDateHolder: null,
			birthDate: null
		})
	}

	save() {
		this.validateInputs();
		if (Object.keys(this.errors).length > 0) {
			return;
		}
		this.organizeData();
		this.loading = true;
		this.complexService.createLeaseAndTenants(this.apartmentKey, this.form)
			.then(() => {
				this.close.emit(this.form)
				this.loading = false;
			}, err => {
				this.loading = false;
				this.errors.save = err;
			});
	}

	private organizeData() {
		this.form.startDate = Moment(this.startDay, 'DD MMM YYYY').valueOf() + "";
		this.form.endDate = Moment(this.endDay, 'DD MMM YYYY').valueOf() + "";

		this.form.tenants.forEach(tenant => {
			// let splitName = tenant.firstName.split(' ');
			// tenant.firstName = splitName.splice(0, 1)[0];
			// tenant.lastName = splitName.join(' ');
			tenant.birthDate = Moment(tenant.birthDateHolder, 'DD MMM YYYY').valueOf() + "";
		})

		this.form.payments.forEach((p, i, a) => {
			if(!p.monthlyChargeAmount || p.monthlyChargeAmount === 0) a.splice(i, 1)
		})
	}

	private validateInputs() {
		this.errors = {};
		if (!this.apartmentKey) this.errors.apartment = "Please choose a valid apartment";

		if (!this.startDay || !this.endDay) this.errors.date = "Please choose valid dates";
		else if (Moment(this.endDay, 'DD MMM YYYY').valueOf() - Moment(this.startDay, 'DD MMM YYYY').valueOf() <= 0) this.errors.date = "Date range isn't valid"

		if (!this.form.leaseUrl || this.form.leaseUrl.length == 0) this.errors.leaseUrl = "Please provide a lease scan"

		this.errors.payments = {};
		for (let paymentIndex in this.form.payments) {
			let pay = this.form.payments[paymentIndex];
			if (!(pay.monthlyChargeName && pay.monthlyChargeName == 'parking')) {
				this.errors.payments[paymentIndex] = {}
				if (!pay.monthlyChargeAmount || pay.monthlyChargeAmount.length == 0) this.errors.payments[paymentIndex].monthlyChargeAmount = "Please fill payment the amount";
				else pay.monthlyChargeAmount = +pay.monthlyChargeAmount;
				if (!pay.monthlyChargeName || pay.monthlyChargeName.length == 0) this.errors.payments[paymentIndex].monthlyChargeName = "Please fill payment name";
				if (Object.keys(this.errors.payments[paymentIndex]).length == 0) delete this.errors.payments[paymentIndex];
			}
		}
		if (Object.keys(this.errors.payments).length == 0) delete this.errors.payments;

		this.errors.tenants = {};

		if (this.form.autoRenew === null) delete this.form.autoRenew;

		for (let tenantIndex in this.form.tenants) {

			let tenant = this.form.tenants[tenantIndex];
			this.errors.tenants[tenantIndex] = {}

			tenant.rentPercantage = +tenant.rentPercantage;

			if (!tenant.firstName || tenant.firstName.length == 0) this.errors.tenants[tenantIndex].firstName = "Please fill tenant's first name"
			if (!tenant.lastName || tenant.lastName.length == 0) this.errors.tenants[tenantIndex].lastName = "Please fill tenant's last name"

			if (!tenant.birthDateHolder || tenant.birthDateHolder.length == 0) this.errors.tenants[tenantIndex].birthDate = "Please fill tenant's birth day";

			if (!tenant.email || tenant.email.length == 0) this.errors.tenants[tenantIndex].email = "Please fill tenant's email";
			else if (!this.stringValidation.isValidEmail(tenant.email)) this.errors.tenants[tenantIndex].email = "Not a valid email address";

			for (let phoneIndex in tenant.phoneNumbers) {
				let phone = (<HTMLInputElement>document.getElementById('tenant' + tenantIndex + 'phone' + phoneIndex)).value
				if (!phone || phone == "") this.errors.tenants[tenantIndex].phoneNumbers = "Please fill the phone number"
				else tenant.phoneNumbers[phoneIndex] = phone
			}

			if (Object.keys(this.errors.tenants[tenantIndex]).length == 0) delete this.errors.tenants[tenantIndex];

		}
		if (Object.keys(this.errors.tenants).length == 0) delete this.errors.tenants;
	}

	promptClose() {
		if (confirm('Are you sure you want to close? Unsaved changes will be deleted')) {
			this.close.emit(undefined);
		}
	}
}