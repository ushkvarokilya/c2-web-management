import { Action, ActionCreator } from 'redux';
import { Notification } from './notifications.interface';

export const NOTIFICATIONS_ACTIONS = {
	LOAD: "[notifications] load"
}

export interface NotificationsAction extends Action{
	notifications: Notification[]
}


export const loadNotifications: ActionCreator<NotificationsAction> = (notifications) => ({
	type: NOTIFICATIONS_ACTIONS.LOAD,
	notifications
})