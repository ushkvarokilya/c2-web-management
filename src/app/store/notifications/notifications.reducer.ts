import { NOTIFICATIONS_ACTIONS, NotificationsAction } from './notifications.ac'
import { Notification, Notifications, notificationsInit } from './notifications.interface';
import { Reducer, Action } from 'redux';
import * as moment from 'moment';

let loadNotifications = (state: Notifications, action: NotificationsAction) => {
	let days = state.days
	action.notifications.forEach(notification => {
		let notificationDay = moment(+notification.dateCreated).startOf('day').valueOf() + '';
		let dayIndex = days.findIndex(d => d.date == notificationDay);
		if (dayIndex > -1) {
			days[dayIndex].notifications.push(notification);
			days[dayIndex].notifications.sort((a, b) => +a.dateCreated - +b.dateCreated);
		} else {
			days.push({
				date: notificationDay,
				notifications: [notification]
			})
		}
	})
	days.sort((a, b) => +b.date - +a.date);
	let today = days.find(day => day.date === moment().startOf('day').valueOf() + "")
	let unreadCount = today ? today.notifications.length : 0
	return Object.assign({}, state, { days, unreadCount });
}


export const notificationsReducer: Reducer<Notifications> = (state: Notifications = notificationsInit, action: Action) => {
	switch (action.type) {
		case NOTIFICATIONS_ACTIONS.LOAD: return loadNotifications(state, <NotificationsAction>action)
		default: return state;
	}
}