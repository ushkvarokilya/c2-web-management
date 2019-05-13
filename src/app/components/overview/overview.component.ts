import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as moment from 'moment';

import { AppState } from '../../store/appState';
import { Company } from '../../store/company/company.interface';
import { ComplexService } from '../../services/complex.service';
import { Observable } from "rxjs/Observable";
import { User } from "../../store/user/user.interface";
import { Announcement } from '../../store/announcements/announcements.interface';

import { environment } from "../../../environments/environment";
import { Http, Response, Headers } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
	selector: 'overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit {

	company$: Observable<any>;
	user$: Observable<User>;
	activeAnnouncemets$: Observable<Announcement[]>;

	tempAnnouncemets;
	toDoList;
	apartmentCount;
	tenantCount;
	facilityCounters;
	LastSync;
	paymentsFromServer;

	tickets;
	inProgressCount = 0;
	newCount = 0;
	vendorsCount = 0;

	lastSync

	payments: {
		overdueCount: number,
		overdueSum: number,
		paidCount: number,
		paidSum: number,
		unpaidCount: number,
		unpaidSum: number
	};

	carouselStep = 0;

	statuses = {
		In_Progress: "In Progress",
		New: "New",
		Done: "Done",
		Vendor: "Vendor"
	}

	moment = moment;

	occupiedApartment = 0;
	vacantApartment = 0;

	environment = environment;
	complex;
	maintenesCounters: any;

	constructor(
		private activatedRoute: ActivatedRoute,
		private complexService: ComplexService,
		private redux: NgRedux<AppState>,
		private http: Http
	) {
		// let lastWeek = moment().add(2, 'weeks').startOf('week');
		// let lastWeekLabel = lastWeek.format('DD MMM') + ' - ' + lastWeek.endOf('week').format('DD MMM');
		// this.toDoList = [{
		// 	label: "Today",
		// 	events: []
		// }, {
		// 	label: 'This Week',
		// 	events: []
		// }, {
		// 	label: 'Next Week',
		// 	events: []
		// }, {
		// 	label: lastWeekLabel,
		// 	events: []
		// }];

		let lastWeek = moment().add(2, 'weeks').startOf('week');
		let lastWeekLabel = lastWeek.format('DD MMM') + ' - ' + lastWeek.endOf('week').format('DD MMM');
		let hour = 1 * 60 * 60 * 1000;
		this.toDoList = [{
			label: "Today",
			events: [{
				eventType: 'Tenants',
				name: 'Move in Unit 101',
				time: moment().utcOffset(0).set({ hour: 10, minute: 30, second: 0, millisecond: 0 }).format('hh:mm A')
			}, {
				eventType: 'Tenants',
				name: 'Move in Unit 204',
				time: moment().utcOffset(0).set({ hour: 12, minute: 30, second: 0, millisecond: 0 }).format('hh:mm A')
			}, {
				eventType: 'Maintenance',
				name: 'Fire dept. inspection',
				time: moment().utcOffset(0).set({ hour: 16, minute: 30, second: 0, millisecond: 0 }).format('hh:mm A')
			}]
		}, {
			label: 'This Week',
			events: [{
				eventType: 'General',
				name: 'Happy hour event',
				time: moment().add(1, 'day').format('DD MMM')
			}, {
				eventType: 'Bookkeeping',
				name: 'Send accounting report',
				time: moment().add(1, 'day').format('DD MMM')
			}]
		}, {
			label: 'Next Week',
			events: [{
				eventType: 'General',
				name: 'Cleaning',
				
				time: moment().startOf('week').add(1, 'week').add(2, 'day').format('DD MMM')
			}]
		}, {
			label: lastWeekLabel,
			events: []
		}];

		this.tempAnnouncemets = [
			{ message: 'Welcome to our community platform, powered by C2' },
			{ message: 'Electricity will be off tomorrow starting 12:00PM' }
		];
	}

	ngOnInit() {
		this.user$ = this.redux.select(state => state.user)
		this.company$ = this.redux.select(state => state.company)
		this.activeAnnouncemets$ = this.redux.select((state: AppState) => state.announcements.active)

		let subscription = this.company$.subscribe((company: Company) => {
			if (company.currentComplex !== null && company.complexes.length > 0) {
				this.complex = company.currentComplex;
				//this.getLastSync(company.currentComplex.key)
				this.loadData();
				if (subscription) subscription.unsubscribe()
			}
		})

		this.activatedRoute.queryParams.subscribe((params: any) => {
			if (params.state && params.code) {
				this.UpdateCommunityPaymentId(params.state, params.code)
					.then(result => {
						const res = result.json();
						if (res.status) this.LastSync.accountIds.StripeConnect = params.code;
						location.replace(location.href.split('?')[0])
					})
					.catch(err => console.log(err));
			}
		})
	}

	private UpdateCommunityPaymentId(communityId, code) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json; charset=utf-8');
		headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
		const json = { code: code };
		return this.http.post(this.environment.accounting_api_endpoint + 'Temp/' + communityId + '/stripe', json, { headers: headers }).toPromise();
	}

	private loadData() {
		let time = Date.now()

		// this.complexService.getGeneralOverview()
		// 	.then(_ => {
		// 		console.log('time to general overview', (Date.now() - time) / 1000)
		// 	})

		var headers = new Headers();
		headers.append('Content-Type', 'application/json; charset=utf-8');
		headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
		this.http.get(this.environment.accounting_api_endpoint + 'Temp/' + this.complex.code + '/LastSync', { headers: headers })
			.toPromise().then(res => {
				this.LastSync = res.json();

				//console.log(this.LastSync);

				let last = new Date(this.LastSync.lastSyncTenants);
				last.setHours(last.getHours() + last.getTimezoneOffset() / 60);
				let next = new Date(last);
				next.setHours(next.getHours() + 12);
				var options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

				this.LastSync.lastSyncT = last.toLocaleDateString("en-US", options);
				this.LastSync.lastSyncTN = next.toLocaleDateString("en-US", options);

				let lastTR = new Date(this.LastSync.lastSyncTransactions);
				lastTR.setHours(lastTR.getHours() + lastTR.getTimezoneOffset() / 60);
				let nextTR = new Date(lastTR);
				nextTR.setHours(nextTR.getHours() + 3);

				this.LastSync.lastSyncTR = lastTR.toLocaleDateString("en-US", options);
				this.LastSync.lastSyncTRN = nextTR.toLocaleDateString("en-US", options);
			}).catch();

		var headers = new Headers();
		headers.append('Content-Type', 'application/json; charset=utf-8');
		headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
		this.http.get(this.environment.accounting_api_endpoint + 'Temp/' + this.complex.code + '/OverviewFacility', { headers: headers })
			.toPromise().then(res => {
				this.facilityCounters = res.json();
				this.facilityCounters.unitsP = 100;
				this.facilityCounters.occupiedUnitsP = (this.facilityCounters.occupiedUnits / this.facilityCounters.units * this.facilityCounters.unitsP).toFixed(2);
				this.facilityCounters.availableUnitsP = (this.facilityCounters.availableUnits / this.facilityCounters.units * this.facilityCounters.unitsP).toFixed(2);
			}).catch();

		this.http.get(this.environment.vendor_api_endpoint + 'manager/GetTicketsCounts/' + this.complex.key, { headers: headers })
			.toPromise().then(res => {
				this.maintenesCounters = res.json();
				//console.log(this.maintenesCounters);
			}).catch();

		var headers = new Headers();
		headers.append('Content-Type', 'application/json; charset=utf-8');
		headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
		this.http.get(this.environment.accounting_api_endpoint + 'Temp/' + this.complex.code + '/analytics', { headers: headers })
			.toPromise().then(res => {
				this.paymentsFromServer = res.json();
			}).catch(err => console.log(err));

		// this.complexService.getEventsOverview()
		// 	.then((data: any) => {
		// 		if (data.items) {
		// 			data.items.forEach(event => {
		// 				event.time = moment(+event.startDate).format('DD MMM YY');
		// 				let eventDay = moment(+event.startDate);
		// 				if (eventDay.isSame(moment(), 'day')) {
		// 					this.toDoList[0].events.push(event);
		// 					event.time = moment(+event.startDate).format('hh:mm A');
		// 				}
		// 				else if (eventDay.isSame(moment(), 'week')) this.toDoList[1].events.push(event);
		// 				else if (eventDay.isSame(moment().add(1, 'week'), 'week')) this.toDoList[2].events.push(event);
		// 				else if (eventDay.isSame(moment().add(2, 'week'), 'week')) this.toDoList[3].events.push(event);
		// 			})
		// 			this.toDoList.forEach(day => {
		// 				day.events.sort((eventA, eventB) => {
		// 					if (eventA.startDate > eventB.startDate) return 1
		// 					if (eventA.startDate < eventB.startDate) return -1
		// 					return 0;
		// 				})
		// 			})
		// 		}
		// 	});

		// this.complexService.getTenantCount()
		// 	.then((data: any) => {
		// 		this.apartmentCount = data.apartmentCount;
		// 		this.tenantCount = data.tenantCount;
		// 	})
		// 	.catch(_ => {

		// 	})

		// this.complexService.getPaymentsOverview()
		// 	.then((data: any) => {
		// 		onF()
		// 		this.payments = data
		// 	})

		// this.complexService.getTicketsOverview()
		// 	.then((data: any) => {
		// 		this.tickets = data.items;
		// 		if (this.tickets) this.countTicketTypes();
		// 	})

		// this.complexService.getAllApartmentLeasesFromComplex()
		// 	.then((data) => {
		// 		this.occupiedApartment = data.occupied;
		// 		this.vacantApartment = data.total - data.occupied;
		// 	})

	}

	private countTicketTypes() {
		let i = 0
		this.tickets.forEach(t => {

			if (t.status == "In_Progress") this.inProgressCount++;
			else if (t.status == this.statuses.New) this.newCount++;
			else if (t.status == this.statuses.Vendor) this.vendorsCount++;

			t.dateCreated = moment(+t.dateCreated).format('DD MMM YY hh:mm A')
		})
	}

	getLastSync(complexKey) {
		this.complexService.getLastSuccessfulYardiSync(complexKey).then(res => {
			let time = res.date.substring(11, 16)
			time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
			if (time.length > 1) {
				time = time.slice(1);
				time[5] = +time[0] < 12 ? 'AM' : 'PM';
				time[0] = +time[0] % 12 || 12;
			}
			time = time.join('');
			this.lastSync = res.date.substring(4, 11) + time
		})
	}

	getScheduleDate(date) {
		date = parseInt(date);
		return moment(date).format('DD MMM YYYY')
	}

	moveCarouselRight() {
		let announNum = document.getElementsByClassName('announcemet').length;
		if (this.carouselStep !== announNum - 1) {
			let carouselWidth = (<HTMLDivElement>document.getElementsByClassName('announcemet')[0]).offsetWidth;
			let carouselElement = <HTMLDivElement>document.getElementById('carousel');
			carouselElement.style.left = (+carouselElement.style.left.replace('px', '') - carouselWidth) + "px";
			this.carouselStep += 1;
		}
	}

	moveCarouselLeft() {
		if (this.carouselStep !== 0) {
			let carouselWidth = (<HTMLDivElement>document.getElementsByClassName('announcemet')[0]).offsetWidth;
			let carouselElement = <HTMLDivElement>document.getElementById('carousel');
			carouselElement.style.left = (+carouselElement.style.left.replace('px', '') + carouselWidth) + "px";
			this.carouselStep -= 1;
		}
	}

	goToStripeConnect() {
		location.replace(`https://connect.stripe.com/oauth/authorize?redirect_uri=${location.href}&client_id=${this.environment.stripe_client_id}&state=${this.complex.key}&response_type=code&scope=read_write`)
	}
}