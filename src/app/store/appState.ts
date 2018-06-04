import { User, UserInit } from './user/user.interface'
import { Company, companyInit } from './company/company.interface';
import { Notifications, notificationsInit } from './notifications/notifications.interface';
import { Announcements, announcementsInit } from './announcements/announcements.interface';
import { Messages, messagesInit } from './messages/messages.interface'

export interface AppState {
    user: User;
    company: Company;
    notifications: Notifications;
    announcements: Announcements;
    messages: Messages;
}
export const initialState: AppState = {
    user: UserInit,
    company: companyInit,
    notifications: notificationsInit,
    announcements: announcementsInit,
    messages: messagesInit
};