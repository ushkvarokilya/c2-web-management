import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as moment from 'moment';
import { Observable } from "rxjs/Observable";

import { AppState } from '../../store/appState';
import { AnnouncementService } from '../../services/announcement.service';
import { User } from "../../store/user/user.interface";
import { Announcement } from '../../store/announcements/announcements.interface';

@Component({
	selector: 'announcements',
	templateUrl: './announcements.component.html',
	styleUrls: ['./announcements.component.scss'],
})

export class AnnouncementsComponent implements OnInit {

	newAnnoun;

	searchQuery;

	from;
	to;

	hours;
	minutes;

	showPublish= false;

	errors;

	publishing;
	publishingError;

	user$: Observable<User>
	activeAnnouncements$: Observable<Announcement[]>;
	archivedAnnouncements$: Observable<Announcement[]>;

	moment = moment;

	constructor(private redux: NgRedux<AppState>, private announcementService: AnnouncementService) {
		this.hours = [];
		for (let i = 1; i <= 23; i++) this.hours.push(i)
		this.minutes = [];
		for (let i = 0; i <= 59; i++) this.minutes.push(i);
	}

	ngOnInit() {
		this.user$ = this.redux.select(state => state.user)
		this.activeAnnouncements$ = this.redux.select((state: AppState) => state.announcements.active)
		this.archivedAnnouncements$ = this.redux.select((state: AppState) => state.announcements.archived)

		this.initNewAnnou();
	}

	initNewAnnou(announcementBody = "", showSchedule = false, fromDay = "", fromHour = "", fromMinute = "", toDay = "", toHour = "", toMinute = "", key?) {
		this.newAnnoun = {
			key,
			announcementBody,
			showSchedule,
			fromDay,
			fromHour,
			fromMinute,
			toDay,
			toHour,
			toMinute,
		}
	}

	getScheduleDate(date) {
		date = parseInt(date);
		return moment(date).format('DD MMM YYYY')
	}

	publish() {
		this.validateInputs();
		if (this.errors) return true;
		let companyState = this.redux.getState().company;
		this.publishing = true;
		let announcementToPublish: any = {
			createdAt: Date.now() + "",
			author: this.redux.getState().user.firstName + ' ' + this.redux.getState().user.lastName,
			announcementBody: this.newAnnoun.announcementBody,
			active: true,
			authorAvatarUrl: "url"
		}
		if (this.newAnnoun.showSchedule) {
			announcementToPublish.scheduledFrom = this.from + "";
			announcementToPublish.scheduledTo = this.to + "";
		}
		((): Promise<any> => {
			if (this.newAnnoun.key) {
				announcementToPublish.key = this.newAnnoun.key
				return this.announcementService.updateAnnouncement(announcementToPublish)
			} else {
				return this.announcementService.publishAnnouncement(companyState.currentComplex.key, announcementToPublish)
			}
		}).bind(this)()
			.then(() => {
				this.publishing = false;
				this.showPublish = false;
				this.initNewAnnou();
			}, err => {
				this.publishingError = "Error publishing the announcement";
				this.publishing = false;
			})
	}

	private validateInputs() {
		this.errors = {};
		if (!this.newAnnoun.announcementBody || this.newAnnoun.announcementBody.length == 0) this.errors.announcementBody = "Please fill the message"
		if (this.newAnnoun.announcementBody.length > 140) this.errors.announcementBody = "The message can't have more then 140 characters"
		if (this.newAnnoun.showSchedule) {
			if (!this.newAnnoun.fromDay || !this.newAnnoun.fromHour || !this.newAnnoun.fromMinute ||
				!this.newAnnoun.toDay || !this.newAnnoun.toHour || !this.newAnnoun.toMinute) this.errors.showSchedule = "Please fill all fileds"
			else {
				let from = moment(this.newAnnoun.fromDay, "DD MMM YY").add(this.newAnnoun.fromHour, 'hours').add(this.newAnnoun.fromMinute, 'minutes').valueOf();
				let to = moment(this.newAnnoun.toDay, "DD MMM YY").add(this.newAnnoun.toHour, 'hours').add(this.newAnnoun.toMinute, 'minutes').valueOf();
				if (to - from < 1) this.errors.showSchedule = "Time frame isn't valid";
				else {
					this.from = from + "";
					this.to = to + "";
				}
			}
		}
		if (this.errors.toString()) delete this.errors;
	}

	showEditAnnoun(ann) {
		this.showPublish = true;
	}

	editAnnouncement(ann) {
		this.initNewAnnou(
			ann.message,
			ann.scheduled.from,
			moment(+ann.scheduled.from).format('DD MMM YY'),
			moment(+ann.scheduled.from).hours() + '',
			moment(+ann.scheduled.from).minutes() + '',
			moment(+ann.scheduled.to).format('DD MMM YY'),
			moment(+ann.scheduled.to).hours() + '',
			moment(+ann.scheduled.to).minutes() + '',
			ann.key
		)
		setTimeout(() => this.showPublish = true, 200)
		
	}

	deleteAnnoun(ann) {
		this.announcementService.deleteAnnouncement(ann)
			.then(_ => { },
			err => { });
	}

	reactiveAnnoun(ann) {

	}

	toggleAddAnnouncemet(){
		this.showPublish = !this.showPublish
		this.initNewAnnou()
	}

}