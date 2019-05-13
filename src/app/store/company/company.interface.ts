export interface Company {
	currentComplex: Complex
	complexes: Complex[]
	name: string
	imageUrl: string
}

export interface Complex{
	name: string
	key: string
	address: string
	imageUrl: string
	tenants?: Tenant[]
	notificationCount: number,
	code: string
}	

export interface Tenant{
	firstName: string
	lastName: string
	name: string
	building: {
		key: string
		name: string
	}
	profileUrl?: string
	key: string
	type: "regular" | "child"
	apartmentName: string
	apartment: string
	restrictions?: string[]
	entranceDate: string
}

export let companyInit: Company = {
	currentComplex: null,
	complexes: [],
	name: null,
	imageUrl: null,
}

export const complexKeyLocalStorageString = "currentComplexKey"