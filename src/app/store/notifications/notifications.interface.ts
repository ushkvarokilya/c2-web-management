export interface Notifications {
	days: Day[],
	unreadCount: number
}

export interface Day{
	date: string,
	notifications: Notification[]
}

export interface Notification {
	key: string,
	type: string,
	dateCreated: string,
	notificationLine: string,
	relevantEntityKey: string
}

export let notificationsInit: Notifications = {
	days: [],
	unreadCount: 0
}