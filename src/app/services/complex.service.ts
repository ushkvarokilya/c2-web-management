import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import * as moment from 'moment';

import { AppHttpService } from './shared/http';
import { loadTenantsToComplex, updateCurrentComplexPhoto } from '../store/company/company.ac';
import { AppState } from '../store/appState';

@Injectable()
export class ComplexService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	loadCurrentComplexTenants() {
		let companyState = this.redux.getState().company;
		let currentComplexKey = companyState.currentComplex.key;
		return this.http.get(`/complex/${currentComplexKey}/tenants`)
			.then((data: any) => {
				if (data && data.tenants) {
					data.tenants = data.tenants.map(t => ({
						name: t.firstName + ' ' + t.lastName,
						firstName: t.firstName,
						lastName: t.lastName,
						apartment: t.apartmentName,
						building: t.building,
						imageUrl: t.profileUrl,
						key: t.key
					}))
				}
				this.redux.dispatch(loadTenantsToComplex(currentComplexKey, data.tenants))
				return Promise.resolve()
			})
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'loadCurrentComplexTenants'))
	}

	getGeneralOverview() {
		let compantState = this.redux.getState().company
		let complexKey = compantState.currentComplex.key;
		let startDate = moment().valueOf();
		let endDate = moment().add(1, 'month').valueOf();
		return this.http.get(`/complex/${complexKey}/overview/startDate/${startDate}/endDate/${endDate}`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getGeneralOverview'));
	}

	getAllApartmentLeasesFromComplex() : any{
		let compantState = this.redux.getState().company
		let complexKey = compantState.currentComplex.key
		return this.http.get(`/complex/${complexKey}/apartment/lease/active/true/archive/true`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getAllApartmentLeasesFromComplex'))
	}

	// getAllApartmentLeasesFromComplexNew() : any{
	// 	let compantState = this.redux.getState().company
	// 	let complexKey = compantState.currentComplex.key
	// 	return this.http.getNew(`/api/Temp/2101/tenants`)
	// 		.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getAllApartmentLeasesFromComplex'))
	// }

	addTenantNote(tenantKey, note: { note: string, managerKey: string, publishDate: string }) {
		return this.http.putPromisified(`/tenant/${tenantKey}/note`, note)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'addTenantNote'))
	}

	deleteTenantNote(tenantKey, publishDate) {
		return this.http.postPromisified(`/tenant/${tenantKey}/note/delete/${publishDate}`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'deleteTenantNote'))
	}

	editTenantNote(tenantKey, note: { note: string, managerKey: string, publishDate: string, previousPublishDate: string }) {
		return this.http.postPromisified(`/tenant/${tenantKey}/note`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'editTenantNote'))
	}

	createLeaseAndTenants(apartmentKey, lease: any) {
		return this.http.putPromisified(`/apartment/lease/${apartmentKey}`, JSON.stringify(lease))
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'createLeaseAndTenants'))
	}

	getUnassignedApartments(complexKey) {
		return this.http.get(`/complex/${complexKey}/apartment/unassigned`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'UnassignedApartments'))
	}

	updateComplexPhoto(photoUrl) {
		let companyState = this.redux.getState().company;
		return this.http.postPromisified(`/complex/${companyState.currentComplex.key}/photo`, { photoUrl })
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'ateComplexPhoto'))
			.then(() => {
				this.redux.dispatch(updateCurrentComplexPhoto(photoUrl));
				return Promise.resolve()
			}), Promise.reject
	}

	getFacilityOverview() {
		let managerKey = this.redux.getState().user.key
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		let now = moment(new Date());
		let threeYearsFromNow = moment(now).add(3, 'years');
		return this.http.get(`/complex/${complexKey}/manager/${managerKey}/overview/facility/start/${now.month() + 1}/${now.year()}/end/${threeYearsFromNow.month() + 1}/${threeYearsFromNow.year()}`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getFacilityOverview'))
	}

	addUnit(unit) {
		let unitToSave = {
			unitName: unit.name,
			size: unit.size,
			bedroomCount: unit.bedrooms,
			bathroomCount: unit.bathrooms,
			amenities: Object.keys(unit.amenities),
			apartmentKeys: unit.apartments,
			planImageUrl: unit.planImageUrl
		}
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		return this.http.putPromisified(`/unit/complex/${complexKey}`, unitToSave)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'addUnit'))
	}

	updateUnit(unitKey, unit) {
		let unitToSave = {
			unitName: unit.name,
			size: unit.size,
			bedroomCount: unit.bedrooms,
			bathroomCount: unit.bathrooms,
			amenities: Object.keys(unit.amenities),
			apartmentKeys: unit.apartments,
			planImageUrl: unit.planImageUrl
		}
		return this.http.postPromisified(`/unit/${unitKey}`, unitToSave)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'updateUnit'))
	}

	deleteUnit(unitKey) {
		return this.http.postPromisified(`/unit/${unitKey}/delete`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'deleteUnit'))
	}

	getCollectionOverview() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		return this.http.get(`/complex/${complexKey}/collections/date/${moment(Date.now()).month() + 1}/${moment(Date.now()).year()}`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'FacilityOverview'))
	}

	addOneTimePayment(name, amount, monthlyPaymentKey) {
		return this.http.postPromisified(`/payment/monthlyPayment/${monthlyPaymentKey}`, { monthlyChargeName: name, monthlyChargeAmount: amount })
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'CollectionOverview'));
	}

	removeOneTimePayment(id, monthlyPaymentKey) {
		return this.http.postPromisified(`/payment/onetime/delete/${monthlyPaymentKey}/id/${id}`, {})
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'CollectionOverview'));
	}

	//new overview endpoints
	getTenantCount() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		return this.http.get(`/complex/${complexKey}/tenant/count`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getTenantCount'));
	}

	getPaymentsOverview() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		return this.http.get(`/complex/${complexKey}/payments/overview`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getPaymentsOverview'));
	}

	getTicketsOverview() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		return this.http.get(`/complex/${complexKey}/tickets/overview`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getTicketsOverview'));
	}

	getEventsOverview() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key;
		let startDate = moment().valueOf();
		let endDate = moment().add(1, 'month').valueOf();
		return this.http.get(`/complex/${complexKey}/events/startDate/${startDate}/endDate/${endDate}`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getEventsOverview'));
	}

	deleteApartment(apartmentKey) {
		return this.http.postPromisified(`/apartment/${apartmentKey}/delete`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'deleteApartment'));
	}

	editApartmentName(apartmentKey, name) {
		return this.http.postPromisified(`/apartmnent/${apartmentKey}/edit/name`, { name })
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'editApartmentName'));
		}

	addStripeAccount(stripeConnectId: string, complexKey?: string) {
		if (!complexKey) {
			let companyState = this.redux.getState().company;
			complexKey = companyState.currentComplex.key;
		}
		return this.http.putPromisified(`/complex/${complexKey}/stripe/connect`, { stripeConnectId })
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'addStripeAccount'));
	}

	getLastSuccessfulYardiSync(complexKey) : any{
		return this.http.get(`/yardi/complex/${complexKey}`)
			.catch(err => this.http.commonCatchAndReject(err, 'ComplexService', 'getLastSuccessfulYardiSync'));
	}

}