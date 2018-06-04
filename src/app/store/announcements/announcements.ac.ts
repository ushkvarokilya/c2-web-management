import { Action, ActionCreator } from 'redux';
import { Announcement, Announcements } from './announcements.interface';

export const AnnouncementsActionsNames = {
	Load: '[announcements] load',
	Publish: '[announcements] publish',
	Delete: '[announcements] delete',
	Archive: '[announcements] archive',
	Reactivate: '[announcements] reactivate',
	Edit: '[announcements] edit'
};

export interface AnnouncementsAction extends Action{
	announcements: Announcements
}

export interface AnnouncementAction extends Action{
	announcement: Announcement
}

export const loadAnnouncementAction: ActionCreator<AnnouncementsAction> = (announcements) => ({
	type: AnnouncementsActionsNames.Load,
	announcements
})

export const publishAnnouncementAction: ActionCreator<AnnouncementAction> = (announcement) => ({
	type: AnnouncementsActionsNames.Publish,
	announcement
})

export const deleteAnnouncementAction: ActionCreator<AnnouncementAction> = (announcement) => ({
	type: AnnouncementsActionsNames.Delete,
	announcement
})

export const archiveAnnouncementAction: ActionCreator<AnnouncementAction> = (announcement) => ({
	type: AnnouncementsActionsNames.Archive,
	announcement
})

export const reactivateAnnouncementAction: ActionCreator<AnnouncementAction> = (announcement) => ({
	type: AnnouncementsActionsNames.Reactivate,
	announcement
})

export const editAnnouncementAction: ActionCreator<AnnouncementAction> = (announcement) => ({
	type: AnnouncementsActionsNames.Edit,
	announcement
})
