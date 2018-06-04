export interface Announcements{
	active: Announcement[],
	archived: Announcement[]
}

export interface Announcement{
	key: string,
	publisher: string,
	message: string,
	scheduled: {
		from: number,
		to: number
	}
}

export const announcementsInit: Announcements = {
	active: [],
	archived: []
}