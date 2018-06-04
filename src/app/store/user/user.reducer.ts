import { USERACTIONS } from './user.ac'
import { User, UserInit } from './user.interface';
import { Reducer, Action } from 'redux';
import * as UserActions from './user.ac';

let logginin = (state: User, action: UserActions.LoginAction) => {
	return Object.assign({},
		UserInit,
		{ email: action.email });
}

let loginFaield = (state: User, action: Action) => {
	return Object.assign({},
		UserInit,
		{ email: state.email })
}

let loggedIn = (state: User, action: UserActions.LoggedinAction) => {
	return Object.assign({},
		UserInit,
		{ email: state.email },
		action,
		{ currentComplexKey: state.currentComplexKey })
}

let setToken = (state: User, action: UserActions.SetTokenAction) =>
	Object.assign({},
		state,
		{ token: action.token })


let setEmail = (state: User, action: UserActions.SetEmailAction) => 
	Object.assign({}, state, { email: action.email })

export const userReducer: Reducer<User> = (state: User = UserInit, action: any) => {
	switch (action.type) {
		case USERACTIONS.LOGGINGIN: return logginin(state, <UserActions.LoginAction>action)
		case USERACTIONS.LOGINFAILED: return loginFaield(state, action)
		case USERACTIONS.LOGGEDIN: return loggedIn(state, <UserActions.LoggedinAction>action)
		case USERACTIONS.LOGOUT: return Object.assign({}, UserInit);
		case USERACTIONS.SetToken: return setToken(state, action)
		case USERACTIONS.SetEmail: return setEmail(state, action)
		default: return state;
	}
}