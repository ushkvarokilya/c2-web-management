interface Complex {
	key: string;
	name: string;
}

export interface User {
	token: string;
	companyKey: string;
	key: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePicture: string;
	position: string;
	currentComplexKey: string;
	viewPermissions: string[];
	actionPermissions: string[];
	isJanitor: boolean
	isLocationManager: boolean
	isRegionalManager: boolean
}


export let UserInit: User = {
	token: null,
	companyKey: null,
	key: null,
	firstName: null,
	lastName: null,
	email: null,
	profilePicture: null,
	position: null,
	currentComplexKey: null,
	viewPermissions: [],
	actionPermissions: [],
	isJanitor: false,
	isLocationManager: false,
	isRegionalManager: false
}
