import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment'
import { Subject } from 'rxjs';

import { CalendarService } from '../../../services/calendar.service';
import { Observable } from "rxjs/Observable";
import { select } from "@angular-redux/store";
import { User } from "../../../store/user/user.interface";

@Component({
	selector: 'facility-calendar',
	templateUrl: './facility-calendar.component.html',
	styleUrls: ['./facility-calendar.component.scss']
})

export class FacilityCalendarComponent implements OnInit {

	@select() user$: Observable<User>
	@Input() dataSubject: Subject<any>

	months = [];

	currentMonthIndex = 0;

	showAddEvent = false;
	showDeleteDialog;
	showDeleteRecurrence;

	newEvent;
	newEventErrors;
	addingNewEvent;

	hours;
	minutes;

	isNewEvent: boolean;

	days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

	moment;

	editIndexs: {
		weekIndex: number,
		day: string,
		eventIndex: number
	}

	loading = true;
	deletingEvent;

	constructor(private calendarService: CalendarService) {
		this.initCal();
		this.hours = [];
		for (let i = 1; i <= 24; i++) {
			if (i > 12) {
				this.hours.push((i - 12) + ' PM')
			} else {
				this.hours.push((i) + ' AM')
			}
		}
		this.minutes = [];
		for (let i = 0; i <= 59; i++) this.minutes.push(i);

		this.moment = moment;
	}

	ngOnInit() {
		this.initNewEvent();
		this.dataSubject.subscribe((data: any) => {
			this.loading = false;
			if (data && data.events) {
				this.renderLoadedEvents(data.events)
			}
		})
	}


	renderLoadedEvents(events) {
		this.initCal();
		events.forEach(e => {
			this.addEventToCal(this.dataIntegration(e));
		})
	}

	private dataIntegration(e) {
		return {
			key: e.key,
			name: e.title,
			fromDate: +e.startDate,
			toDate: +e.endDate,
			fullDay: e.allDay,
			type: e.eventType,
			recurrenceID: e.recurrenceID,
			recurrenceType: e.recurrenceType,
			recurrenceUntil: e.recurrenceUntil,
			repeats: e.recurrence,
			repeatUntil: +e.recurrenceUntil
		}
	}

	private initCal() {
		this.months = [];
		let yearFromNow = moment().add(1, 'year');
		this.renderMonthsUntil(yearFromNow.format('MMMM'), yearFromNow.format('YYYY'));
	}

	changeIndex(amount) {
		if (amount == 1 && this.currentMonthIndex != this.months.length - 1) this.currentMonthIndex++
		else if (amount == -1 && this.currentMonthIndex !== 0) this.currentMonthIndex--;
	}

	addEventToCal(event: CalEvent) {
		let date = moment(+event.fromDate);
		let month = moment(date).format('MMMM');
		let year = moment(date).format('YYYY');
		let monthIndex = this.months.findIndex(m => m.month == month && m.year == year);
		if (monthIndex == -1) {
			this.renderMonthsUntil(month, year);
			monthIndex = this.months.length - 1;
		}
		this.months[monthIndex].weeks.forEach(week => {
			for (let day in week) {
				if (week[day].date == date.date()) week[day].events.push(event);
			}
		});
	}

	private renderMonthsUntil(month, year) {

		let inputMoment = moment(month + ' ' + year, 'MMMM YYYY');
		let lastRenderedMonth = moment(new Date()).subtract(1, 'month');
		if (this.months.length > 0) {
			lastRenderedMonth = this.months[this.months.length - 1];
			lastRenderedMonth = moment(lastRenderedMonth.month + ' ' + lastRenderedMonth.year, 'MMMM YYYY');
		}

		let diffMonth = inputMoment.diff(lastRenderedMonth, 'months');

		for (let i = 1; i <= diffMonth; i++) {

			let thisMonth = moment(lastRenderedMonth).add(i, 'month')

			let month = {
				year: thisMonth.format('YYYY'),
				month: thisMonth.format('MMMM'),
				weeks: []
			}
			let startOfMonth = moment(thisMonth.startOf('month'));
			let endOfMonth = moment(thisMonth.endOf('month'));
			let week = {};

			for (let i = startOfMonth.date(); i <= endOfMonth.date(); i++) {
				let day = moment(startOfMonth).add(i - 1, 'day');

				if (day.day() == 0) week = {};
				week[day.format('ddd').toLowerCase()] = {
					date: day.date(),
					events: [],
					disabled: day.isBefore(moment().subtract(1, 'day'))
				}

				if (day.day() == 6 || i == endOfMonth.date()) month.weeks.push(week);
			}

			this.months.push(month);

		}
	}

	modalVisibiltyChanged() {
		this.showAddEvent = false;
		if (this.newEvent.key) this.initNewEvent();
	}

	openAddEventFromDay(week, day) {
		week[day].showEvents = false;
		this.newEvent.fromDay = (week[day].date < 10 ? '0' + week[day].date : week[day].date) + ' '
			+ this.months[this.currentMonthIndex].month.substring(0, 3) + ' '
			+ this.months[this.currentMonthIndex].year.substring(2, 4);
		this.newEvent.toDay = this.newEvent.fromDay;
		this.showAddEvent = true;
	}

	initNewEvent() {
		this.newEvent = {
			name: "",
			fullDay: true,
			fromDay: "",
			fromHour: "",
			fromMinute: "",
			toDay: "",
			toHour: "",
			toMinute: "",
			type: "Facility",
			repeats: "once",
			repeatUntilHolder: ""
		}
	}

	addEvent() {
		this.checkNewEvent();
		if (!this.newEventErrors) {
			this.addingNewEvent = true;
			this.calendarService.addEvent(this.newEvent)
				.then((data: any) => {
					if (data.items) {
						data.items.forEach(e => {
							this.addEventToCal(this.dataIntegration(e));
						})
					}
					// this.renderEvent(this.newEvent);
					this.initNewEvent();
					this.showAddEvent = false;
					this.addingNewEvent = false;
				}, () => { })
		}
	}

	private checkNewEvent() {
		this.newEventErrors = {};
		if (this.newEvent.name == "") this.newEventErrors.name = "Please provide a name";
		if (this.newEvent.fullDay) {
			if (this.newEvent.fromDay == "") this.newEventErrors.date = "Please provide a date/time";
			else {
				this.newEvent.fromDate = moment(this.newEvent.fromDay, 'DD MMM YY').valueOf();
				this.newEvent.toDay = "";
				this.newEvent.toHour = "";
				this.newEvent.toMinute = "";
			}
		} else {
			if (this.newEvent.fromDay == "" || this.newEvent.fromHour == "" || this.newEvent.fromMinute == "" ||
				this.newEvent.toDay == "" || this.newEvent.toHour == "" || this.newEvent.toMinute == "") {
				this.newEventErrors.date = "Please provide a date/time";
			} else {
				let fh = parseInt(this.newEvent.fromHour.split(' ')[0])
				if (this.newEvent.fromHour.indexOf('PM') > -1) {
					fh += 12
				}
				let th = parseInt(this.newEvent.toHour.split(' ')[0])
				if (this.newEvent.toHour.indexOf('PM') > -1) {
					th += 12
				}
				this.newEvent.fromDate = moment(this.newEvent.fromDay, 'DD MMM YY')
					.hour(fh)
					.minutes(this.newEvent.fromMinute)
					.valueOf()
				this.newEvent.toDate = moment(this.newEvent.toDay, 'DD MMM YY')
					.hour(th)
					.minutes(this.newEvent.toMinute)
					.valueOf()
				if (this.newEvent.toDate <= this.newEvent.fromDate) this.newEventErrors.date = "Time range isn't valid";
				if (this.newEvent.fromDate < moment(new Date()).valueOf()) this.newEventErrors.date = "The chosen date has already passed";
			}
		}

		if (this.newEvent.repeats !== "once" && this.newEvent.repeatUntilHolder == "") this.newEventErrors.repeats = "Please provide a date/time"
		else if (this.newEvent.repeats !== "once") this.newEvent.repeatUntil = moment(this.newEvent.repeatUntilHolder, 'DD MMM YY').add(1, 'days').valueOf()

		if (Object.keys(this.newEventErrors).length == 0) delete this.newEventErrors;
	}

	openEditEvent(event, weekIndex, day, eventIndex, isNewEvent) {
		this.editIndexs = { weekIndex, day, eventIndex };
		this.newEvent = Object.assign({}, event);

		this.newEvent.fromDay = moment(event.fromDate).format('DD MMM YY')
		this.newEvent.fromHour = moment(event.fromDate).format('h A')
		this.newEvent.fromMinute = moment(event.fromDate).format('m')

		this.newEvent.toDay = moment(event.toDate).format('DD MMM YY')
		this.newEvent.toHour = moment(event.toDate).format('h A');
		this.newEvent.toMinute = moment(event.toDate).format('m')

		this.newEvent.repeats = 'once';

		this.showAddEvent = true;		
	}

	editEvent() {
		this.checkNewEvent();
		if (!this.newEventErrors) {
			this.addingNewEvent = true;
			let toSend = {
				fromDate: this.newEvent.fromDate,
				key: this.newEvent.key,
				name: this.newEvent.name,
				recurrenceID: this.newEvent.recurrenceID,
				recurrenceType: this.newEvent.recurrenceType,
				recurrenceUntil: this.newEvent.recurrenceUntil,
				repeats: this.newEvent.repeats,
				repeatUntil: this.newEvent.repeatUntil,
				toDate: this.newEvent.toDate,
				type: this.newEvent.type,
				fullDay: this.newEvent.fullDay
			}
			this.calendarService.editEvent(toSend)
				.then(() => {
					this.showAddEvent = false;

					let event = this.months[this.currentMonthIndex]
								.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
								.events.filter(x => x.key == this.newEvent.key)

					this.months[this.currentMonthIndex]
						.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
						.events.splice(this.months[this.currentMonthIndex]
							.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
							.events.indexOf(event[0]), 1)

					this.addEventToCal(this.newEvent);

					this.initNewEvent();
					this.addingNewEvent = false;
				}, err => { })
		}
	}

	deleteEvent() {
		let event = this.months[this.currentMonthIndex]
		.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
		.events.filter(x => x.key == this.newEvent.key)
		if (this.newEvent.recurrenceType === 'once') {
			this.deletingEvent = true;
			this.calendarService.deleteEvent(this.newEvent.key).then(() => { }, () => { })
			this.months[this.currentMonthIndex]
				.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
				.events.splice(this.months[this.currentMonthIndex]
					.weeks[this.editIndexs.weekIndex][this.editIndexs.day]
					.events.indexOf(event[0]), 1)

			this.showDeleteDialog = false;
			this.initNewEvent()
		} else {
			this.showDeleteDialog = false;
			this.showDeleteRecurrence = true;
		}
	}

	deleteRecurentEvent(recurrenceMode) {
		this.deletingEvent = true;
		this.calendarService.deleteEvent(this.newEvent.key, recurrenceMode)
			.then(() => this.calendarService.getComplexEvents(), () => { })
			.then((data: any) => {
				if (data.items) this.renderLoadedEvents(data.items)
				this.showDeleteRecurrence = false;
				this.deletingEvent = false
				this.initNewEvent()
			}, () => {
				this.deletingEvent = false
			})
	}

	getDateDisplayable(date) {
		return moment(date).format('DD MMM YYYY')
	}
}


interface CalEvent {
	key?: string,
	name: string,
	fromDate?: any,
	toDate?: any,
	fullDay: boolean,
	type: string,
	repeats: string,
	repeatUntil: any
}