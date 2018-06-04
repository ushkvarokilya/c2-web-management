import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as moment from 'moment';

import { AppState } from '../../store/appState';
import { Company } from '../../store/company/company.interface';
import { ComplexService } from '../../services/complex.service';
import { Observable } from "rxjs/Observable";
import { User } from "../../store/user/user.interface";
import { Announcement } from '../../store/announcements/announcements.interface';

@Component({
	selector: 'overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})

export class OverviewComponent implements OnInit {

	company$: Observable<any>;
	user$: Observable<User>;
	activeAnnouncemets$: Observable<Announcement[]>;

	toDoList;
	apartmentCount;
	tenantCount;

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

	constructor(
		private complexService: ComplexService,
		private redux: NgRedux<AppState>
	) {
		let lastWeek = moment().add(2, 'weeks').startOf('week');
		let lastWeekLabel = lastWeek.format('DD MMM') + ' - ' + lastWeek.endOf('week').format('DD MMM');
		this.toDoList = [{
			label: "Today",
			events: []
		}, {
			label: 'This Week',
			events: []
		}, {
			label: 'Next Week',
			events: []
		}, {
			label: lastWeekLabel,
			events: []
		}];
	}

	ngOnInit() {

		this.user$ = this.redux.select(state => state.user)
		this.company$ = this.redux.select(state => state.company)
		this.activeAnnouncemets$ = this.redux.select((state: AppState) => state.announcements.active)

		let subscription = this.company$.subscribe((company: Company) => {
			if (company.currentComplex !== null && company.complexes.length > 0) {
				this.getLastSync(company.currentComplex.key)
				this.loadData()
				if (subscription) subscription.unsubscribe()
			}
		})
	}

	private loadData() {
		let time = Date.now()

		// this.complexService.getGeneralOverview()
		// 	.then(_ => {
		// 		console.log('time to general overview', (Date.now() - time) / 1000)
		// 	})

		this.complexService.getEventsOverview()
			.then((data: any) => {
				if (data.items) {
					data.items.forEach(event => {
						event.time = moment(+event.startDate).format('DD MMM YY');
						let eventDay = moment(+event.startDate);
						if (eventDay.isSame(moment(), 'day')) {
							this.toDoList[0].events.push(event);
							event.time = moment(+event.startDate).format('hh:mm A');
						}
						else if (eventDay.isSame(moment(), 'week')) this.toDoList[1].events.push(event);
						else if (eventDay.isSame(moment().add(1, 'week'), 'week')) this.toDoList[2].events.push(event);
						else if (eventDay.isSame(moment().add(2, 'week'), 'week')) this.toDoList[3].events.push(event);
					})
					this.toDoList.forEach(day => {
						day.events.sort((eventA, eventB) => {
							if (eventA.startDate > eventB.startDate) return 1
							if (eventA.startDate < eventB.startDate) return -1
							return 0;
						})
					})
				}
			})

		this.complexService.getTenantCount()
			.then((data: any) => {
				this.apartmentCount = data.apartmentCount;
				this.tenantCount = data.tenantCount;
			})
			.catch(_ => {

			})

		// this.complexService.getPaymentsOverview()
		// 	.then((data: any) => {
		// 		onF()
		// 		this.payments = data
		// 	})

		this.complexService.getTicketsOverview()
			.then((data: any) => {
				this.tickets = data.items;
				if (this.tickets) this.countTicketTypes();
			})

		this.complexService.getAllApartmentLeasesFromComplex()
			.then((data) => {
				this.occupiedApartment = data.occupied;
				this.vacantApartment = data.total - data.occupied;
			})

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

}