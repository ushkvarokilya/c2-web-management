import { combineReducers, Reducer } from 'redux';
import { AppState } from './appState';
import { userReducer } from './user/user.reducer';
import { companyReducer } from './company/company.reducer';
import { notificationsReducer } from './notifications/notifications.reducer';
import { announcementReducer } from './announcements/announcements.reducer';
import { messagesReducer } from './messages/messages.reducer';

export const rootReducer = combineReducers({
    notifications: notificationsReducer,
    announcements: announcementReducer,
    user: userReducer,
    company: companyReducer,
    messages: messagesReducer
}) as Reducer<AppState>;
