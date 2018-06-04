import { Announcement, Announcements, announcementsInit } from './announcements.interface'
import { AnnouncementsActionsNames, AnnouncementsAction, AnnouncementAction } from './announcements.ac';

import { Reducer, Action } from 'redux'

let loadAnnouncements = (state: Announcements, action: AnnouncementsAction) => 
	Object.assign({}, action.announcements);

let archiveAnnouncement = (state: Announcements, action: AnnouncementAction) => {
	let index = state.active.findIndex((announcements) => {
		return announcements.key == action.announcement.key;
	})
	if (index > -1) {
		let toArchive = state.active.splice(index, 1)[0];
		state.archived.unshift(toArchive);
		return Object.assign({}, state);
	} else {
		return state;
	}
}

let publishAnnouncement = (state: Announcements, action: AnnouncementAction) => {
	state.active.unshift(action.announcement);
	return Object.assign({}, state);
}

let deleteAnnouncement = (state: Announcements, action: AnnouncementAction) => {
	let index = state.active.findIndex((announcements) => {
		return announcements.key == action.announcement.key;
	})
	if (index > -1) {
		state.active.splice(index, 1);
		return Object.assign({}, state);
	} else {
		index = state.archived.findIndex((announcements) => {
			return announcements.key == action.announcement.key;
		})
		if (index > -1) {
			state.archived.splice(index, 1);
			return Object.assign({}, state);
		} else return state;
	}
}

let reactivateAnnouncement =  (state: Announcements, action: AnnouncementAction) => {
	let index = state.archived.findIndex((announcements) => {
		return announcements.key == action.announcement.key;
	})
	if (index > -1) {
		let toActivate = state.archived.splice(index, 1)[0];
		state.active.push(toActivate);
		// state.active = state.active.sort((a,b) => {
		// 	if(a.key)
		// });
		return Object.assign({}, state);
	} else {
		return state;
	}
}

let editAnnouncement = (state: Announcements, action: AnnouncementAction) => {
	let index = state.active.findIndex((announcements) => {
		return announcements.key == action.announcement.key;
	})
	if (index > -1) {
		state.active.splice(index, 1, action.announcement);
		return Object.assign({}, state);
	} else {
		index = state.active.findIndex((announcements) => {
			return announcements.key == action.announcement.key;
		})
		if (index > -1) {
			state.archived.splice(index, 1, action.announcement);
			return Object.assign({}, state);
		} else return state;
	}
}

export const announcementReducer: Reducer<Announcements> = (state: Announcements = announcementsInit, action: any) => {
	switch (action.type){
		case AnnouncementsActionsNames.Load: return loadAnnouncements(state, action)
		case AnnouncementsActionsNames.Archive: return archiveAnnouncement(state, action)
		case AnnouncementsActionsNames.Delete: return deleteAnnouncement(state, action)
		case AnnouncementsActionsNames.Edit: return editAnnouncement(state, action)
		case AnnouncementsActionsNames.Publish: return publishAnnouncement(state, action)
		case AnnouncementsActionsNames.Reactivate: return reactivateAnnouncement(state, action)
		default: return state
	}
}