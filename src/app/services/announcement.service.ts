import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';
import * as AnnouncementActions from '../store/announcements/announcements.ac';
import { Announcements } from '../store/announcements/announcements.interface';

@Injectable()
export class AnnouncementService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	publishAnnouncement(complexKey, announcement: { authorKey?: string, createdAt: string, author: string, announcementBody: string, scheduledFrom?: string, scheduledTo?: string, active: boolean, scheduled: any }) {
		let user = this.redux.getState().user
		announcement.author = user.firstName + ' ' + user.lastName
		announcement.authorKey = user.key
		if (announcement.scheduledFrom == "undefined") delete announcement.scheduledFrom
		if (announcement.scheduledTo == "undefined") delete announcement.scheduledTo
		return this.http.putPromisified(`/complex/${complexKey}/announcement`, announcement)
			.then((data: any) => {
				let toDispatch = {
					key: data.key,
					publisher: announcement.author,
					message: announcement.announcementBody,
					active: announcement.active,
					scheduled: {
						from: announcement.scheduledFrom,
						to: announcement.scheduledTo
					}
				}
				this.redux.dispatch(AnnouncementActions.publishAnnouncementAction(toDispatch))
				return Promise.resolve()
			}, err => Promise.reject(err))
			.catch(err => console.error('AnnouncementService: error while publishAnnouncement', err));
	}

	getAnnouncementsByComplex(complexKey) {
		return this.http.get(`/complex/${complexKey}/announcement`)
			.then((data: any) => {
				let items = data.items;

				if (items && Array.isArray(items)) {
					let announcements: Announcements = {
						active: [],
						archived: []
					}
					items.forEach(ann => {
						ann = {
							publisher: ann.author,
							message: ann.announcementBody,
							active: ann.active,
							scheduled: {
								from: ann.scheduledFrom,
								to: ann.scheduledTo
							},
							key: ann.key
						}
						if (ann.active) announcements.active.push(ann)
						else announcements.archived.push(ann)
					})
					this.redux.dispatch(AnnouncementActions.loadAnnouncementAction(announcements))
				}
				return Promise.resolve()
			}, err => Promise.reject(err))
			.catch(err => console.error('AnnouncementService: error while getAnnouncementsByComplex', err));
	}

	loadAnnouncementsOfCurrentComplex() {
		let companyState = this.redux.getState().company;
		this.getAnnouncementsByComplex(companyState.currentComplex.key)
			.then(() => { }, (err) => console.error(err));
	}

	deleteAnnouncement(announcemet) {
		let companyState = this.redux.getState().company;
		this.redux.dispatch(AnnouncementActions.deleteAnnouncementAction(announcemet))
		return this.http.postPromisified(`/announcement/delete/${announcemet.key}`, "")
			.catch(err => this.http.commonCatchAndReject(err, 'AnnouncementService', 'deleteAnnouncement'))
	}

	updateAnnouncement(announcement) {
		let user = this.redux.getState().user
		announcement.author = user.firstName + ' ' + user.lastName
		announcement.authorKey = user.key
		if (announcement.scheduledFrom == "undefined") delete announcement.scheduledFrom
		if (announcement.scheduledTo == "undefined") delete announcement.scheduledTo
		return this.http.postPromisified(`/announcement/${announcement.key}`, announcement)
			.then(_ => {
				this.loadAnnouncementsOfCurrentComplex()
				return Promise.resolve();
			})
			.catch(err => {
				console.error('AnnouncementService: error while updateAnnouncement:', err)
				return Promise.reject("")
			})
	}

}