import { Action, ActionCreator } from 'redux';

//actions labels

export const USERACTIONS = {
	LOGGINGIN: "[user] logging in",
	LOGINFAILED: "[user] log in failed",
	LOGGEDIN: "[user] logged in",
	UPDATE: "[user] update",
	LOGOUT: "[user] log out",
	SetToken: '[user] set token',
	SetEmail: "[user] set email"
}

//interfaces

export interface LoginAction extends Action {
	email: string
}

export interface LoggedinAction extends Action {
	token: string,
	firstName?: string,
	lastName?: string,
	profilePicture?: string,
	viewPermissions: string[],
	actionPermissions: string[]
	isJanitor: boolean
	isLocationManager: boolean
	isRegionalManager: boolean
}

export interface SetTokenAction extends Action {
	token: string
}

export interface SetEmailAction extends Action {
	email: string
}

//actions
export const logginin: ActionCreator<LoginAction> = (email) => ({
	type: USERACTIONS.LOGGINGIN,
	email
})

export const loginFailed: ActionCreator<Action> = () => ({
	type: USERACTIONS.LOGINFAILED
})

export const loggedin: ActionCreator<LoggedinAction> = (token: string, companyKey: string, key: string, position: string, firstName: string, lastName: string, email: string, profilePicture: string, viewPermissions: string[], actionPermissions: string[], isJanitor: boolean,
	isLocationManager: boolean,
	isRegionalManager: boolean) => ({
		type: USERACTIONS.LOGGEDIN,
		token,
		key,
		companyKey,
		firstName,
		lastName,
		email,
		profilePicture,
		position,
		viewPermissions,
		actionPermissions,
		isJanitor,
		isLocationManager,
		isRegionalManager
	})

export const logout: ActionCreator<Action> = () => ({
	type: USERACTIONS.LOGOUT
})

export const setToken: ActionCreator<Action> = (token: string) => ({
	type: USERACTIONS.SetToken,
	token
})

export const setEmail: ActionCreator<SetEmailAction> = (email: string) => ({
	type: USERACTIONS.SetEmail,
	email
})