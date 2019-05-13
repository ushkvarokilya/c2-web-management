import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgRedux, select } from '@angular-redux/store';
import { Subject, Subscription } from 'rxjs';
import { User } from '../../../store/user/user.interface';
import { AppState } from '../../../store/appState';
import { CompanyService } from '../../../services/company.service';
import { ComplexService } from "../../../services/complex.service";
import { SetUpUser, UsersAndRoles } from "../users-and-roles/users-and-roles.component";
import {Observable} from  "rxjs/Rx";
import * as moment from 'moment'

import { environment } from "../../../../environments/environment";
import { filter, takeWhile } from 'rxjs/operators';

@Component({
	selector: 'app200-facilities',
	templateUrl: './facilities-details.component.html',
	styleUrls: ['./facilities-details.component.scss'],
	host: {
		'(document:click)': 'onDocumentClick($event)',
	}
})

export class FacilitiesComponent implements OnInit {

	@Input() doNext: Subject<string>;
	@Input() nextName: string;
	@Input() users: UsersAndRoles
	@Output() doneNext = new EventEmitter();

	@select() user$: Observable<User>

	facilities: Facility[];

	selectedFacility

	showModal;
	modalHeader;
	removeAptFunction;

	facilitiesLoaded;
	mapsLoaded;

	errors: any[] = [];

	floorsNumKeyUp = new Subject<{ building: Building, num: number }>()
	aptsNumKeyUp = new Subject<{
		floor: {
			apartments: Array<{
				name: string,
				isOccupied: boolean
			}>
		}
		num: number
	}>()

	hours
	minutes

	uploadImageEntity: Amenity & Facility
	uploadImageEntityType: string

	loggedUser;
	isUserHavePerManager = [];
	isUserHavePerJanitor = [];
	

	facilityKeyForStripe_localStorageKey = "facilityKeyForStripe"

	constructor(private redux: NgRedux<AppState>,
		private companyService: CompanyService,
		private complexService: ComplexService,
		private activedRoute: ActivatedRoute) {
		this.hours = [];
		for (let i = 1; i <= 24; i++) {
			if (i > 12) {
				this.hours.push((i - 12) + ' PM')
			} else {
				this.hours.push((i) + ' AM')
			}
		}
		this.minutes = [];
		for (let i = 0; i <= 59; i++) this.minutes.push(i);
	}

	ngOnInit() {
		this.doNext.subscribe(value => {
			if (value == this.nextName) this.next();
		})
		this.getFacilitesData()
		this.floorsNumKeyUp
			.debounceTime(500)
			.distinctUntilChanged()
			.flatMap(event => Observable.of(event).delay(100))
			.subscribe((event) => this.onFloorNumsChange(event.building, event.num));
		this.user$.subscribe(user => {
			this.loggedUser = user;
		})
	}

	private getFacilitesData() {
		let dataFromServerFetched = false
		this.user$
			.pipe(
				filter(user => user.token !== null),
			 	takeWhile(_ => !dataFromServerFetched)
			)
			.subscribe(user => {
				dataFromServerFetched = true
				this.companyService.getComplexesDetailed(user.companyKey)
					.then((data: any) => data.facilities)
					.then((facilities: Facility[]) => {
						if (facilities) {
							this.facilities = facilities.map(facility => this.mapServerFacility(facility))
							this.checkAndConnectStripeAccount()
						} else {
							this.facilities = [this.newFacility()]
						}
						for (let facilityIndex = 0; facilityIndex < this.facilities.length; facilityIndex++){
							if (this.facilities[facilityIndex].locationManagerKeys.indexOf(this.loggedUser.key) == -1) this.isUserHavePerManager[facilityIndex] = false;
							else this.isUserHavePerManager[facilityIndex] = true; 
							if (this.facilities[facilityIndex].janitorKeys.indexOf(this.loggedUser.key) == -1) this.isUserHavePerJanitor[facilityIndex] = false;
							else this.isUserHavePerJanitor[facilityIndex] = true;
						}
					})
			})
	}

	private mapServerFacility(facility) {
		if (facility.buildings) {
			facility.buildings = facility.buildings.map((building: Building) => {
				building.tempId = Date.now() * Math.random()
				return building
			})
		}
		if (!facility.amenities) {
			facility.amenities = []
		}
		if (!facility.locationManagerKeys) {
			facility.locationManagerKeys = []
		}
		if (!facility.janitorKeys) {
			facility.janitorKeys = []
		}
		facility.amenities = facility.amenities.map(amenity => {
			let amenityName
			if (this.defaultAmenitiesMap[amenity.name]) {
				amenityName = this.defaultAmenitiesMap[amenity.name].name
			} else {
				amenityName = amenity.name
			}
			if (!amenity.buildings) {
				amenity.buildings = []
			}
			if (amenity.images) {
				amenity.imagesUrl = amenity.images
				delete amenity.images
			}
			if (!amenity.imagesUrl) {
				amenity.imagesUrl = []
			}
			amenity.buildings = amenity.buildings.map(bulidingKey => {
				return facility.buildings.find(b => b.key === bulidingKey).tempId
			})
			return Object.assign(amenity, { name: amenityName })
		})

		return Object.assign(facility)
	}

	private checkAndConnectStripeAccount() {
		this.activedRoute.queryParams
			.subscribe((params: { code: string, state: string }) => {
				if (params.code) {
					let facilityKeyForStripe = localStorage.getItem(this.facilityKeyForStripe_localStorageKey)
					localStorage.removeItem(this.facilityKeyForStripe_localStorageKey)
					if (params.state === facilityKeyForStripe) {
						this.complexService.addStripeAccount(params.code, facilityKeyForStripe)
							.then(() => {
								this.facilities.find(facility => facility.key === facilityKeyForStripe).stripeConnectId = params.code
							})
							.catch(() => {

							})
					}
				}
			})
	}

	goToStripeConnect(facilityKey) {
		if (facilityKey) {
			localStorage.setItem(this.facilityKeyForStripe_localStorageKey, facilityKey)
			location.replace(`https://connect.stripe.com/oauth/authorize?redirect_uri=${location.href}&client_id=${environment.stripe_client_id}&state=${facilityKey}&response_type=code&scope=read_write`)
		}
	}

	private newFacility(): Facility {
		return {
			name: "",
			address: "",
			latitude: null,
			longitude: null,
			janitorKeys: [],
			locationManagerKeys: [],
			imageUrl: "",
			buildings: [],
			amenities: []
		}
	}


	appendFacility() {
		this.facilities.push(this.newFacility())
		let facilityIndex = this.facilities.length - 1
	}

	toggleJanitorInFacility(facilityIndex, user) {
		let userIndex = this.facilities[facilityIndex].janitorKeys.findIndex(key => key === user.key)
		if (userIndex > -1) {
			this.facilities[facilityIndex].janitorKeys.splice(userIndex, 1)
		} else {
			this.facilities[facilityIndex].janitorKeys.push(user.key)
		}
	}

	isJanitorSelected(amenity, userKey) {
		if (amenity.janitorKeys) {
			return amenity.janitorKeys.findIndex(key => key === userKey) > -1
		}
	}

	toggleLocationManagerInFacility(facilityIndex, user) {
		let userIndex = this.facilities[facilityIndex].locationManagerKeys.findIndex(key => key === user.key)
		if (userIndex > -1) {
			this.facilities[facilityIndex].locationManagerKeys.splice(userIndex, 1)
		} else {
			this.facilities[facilityIndex].locationManagerKeys.push(user.key)
		}
	}

	isLocationManagerSelected(facility, userKey) {
		return facility.locationManagerKeys.findIndex(key => key === userKey) > -1
	}

	onDocumentClick(event) {
		Array.prototype.forEach.call(document.getElementsByClassName('drop-down'), (element: HTMLDivElement, index) => {
			let clickedOnDropdown = element.contains(event.target)
			let clickedOnSelector = element.parentElement.getElementsByClassName("selector")[0].contains(event.target)
			if (!clickedOnDropdown && !clickedOnSelector && element.style.display !== "none") {
				element.style.display = "none"
			}
		})
	}

	private next() {
		if (this.validate()) {
			let facilitiesToSend = this.facilities.map(f => {
				f.amenities = f.amenities.map(a => {
					a.name = Object.keys(DefaultAmenities).find(key => a.name === DefaultAmenities[key].name) || a.name
					return a
				})
				return f
			})
			this.doneNext.emit({ facilities: facilitiesToSend })
		} else {
			this.doneNext.emit({ errors: true })
		}
	}

	private validate() {
		this.errors = this.facilities.map(this.validateFacility.bind(this))
		if (this.isErrorsInArray(this.errors)) {
			return false
		} else {
			this.errors = []
			return true
		}
	}

	private validateFacility(facility: Facility) {
		let errors: any = {}
		if (!facility.name || facility.name.length === 0) {
			errors.name = "Invalid name"
		}
		if (!facility.address || facility.address.length === 0) {
			errors.address = "Invalid address"
		}
		if (!facility.janitorKeys || facility.janitorKeys.length === 0) {
			errors.janitorKeys = "Please choose at least one staff member"
		}
		if (!facility.locationManagerKeys || facility.locationManagerKeys.length === 0) {
			errors.locationManagerKeys = "Please choose at least one location manager"
		}
		let amenityErrors = facility.amenities.map(a => this.validateAmenity(a))
		if (amenityErrors.length > 0 && this.isErrorsInArray(amenityErrors)) {
			errors.amenities = { amenityErrors }
		}
		if (!facility.buildings || facility.buildings.length === 0) {
			errors.buildings = "Need at least one building"
		} else {
			let buildingErrors = facility.buildings.map(b => this.validateBuilding(b))
			if (this.isErrorsInArray(buildingErrors)) {
				errors.buildings = { buildingErrors }
			}
		}
		if (Object.keys(errors).length === 0) errors = undefined
		return errors
	}

	private validateAmenity(amenity: Amenity) {
		let errors: any = {}
		if (!amenity.name || amenity.name.length === 0) {
			errors.name = "Invalid name"
		}
		if (!amenity.buildings || amenity.buildings.length === 0) {
			errors.buildings = "Need at least one building"
		}
		if (!amenity.janitorKeys || amenity.janitorKeys.length === 0) {
			errors.janitorKeys = "Need at least one staff member"
		}
		if (Object.keys(errors).length === 0) errors = undefined
		return errors
	}

	private validateBuilding(building: Building) {
		let errors: any = {}
		if (!building.name || building.name.length === 0) {
			errors.name = "Invalid name"
		}
		if (!building.address || building.address.length === 0) {
			errors.address = "Invalid address"
		}
		if (!building.janitorKeys || building.janitorKeys.length === 0) {
			errors.janitorKeys = "Need at least one staff member"
		}
		if (Object.keys(errors).length === 0) errors = undefined
		return errors
	}

	private isErrorsInArray(errors: any[]) {
		if (errors) {
			for (let error of errors) {
				if (error && Object.keys(error).length > 0) {
					return true
				}
			}
		}
		return false
	}

	// BUILDINGS

	toggleBuildings(facilityIndex) {
		if (this.facilities[facilityIndex].buildings.length === 0) {
			this.appendBuilding(this.facilities[facilityIndex])
		}
		let display = document.getElementById('buildings' + facilityIndex).style.display
		if (display !== "block") {
			document.getElementById('buildings' + facilityIndex).style.display = "block"
		} else {
			document.getElementById('buildings' + facilityIndex).style.display = "none"
		}
	}

	appendBuilding(facility: Facility) {
		facility.buildings.push(this.newBuilding())
		let buildingIndex = facility.buildings.length - 1
	}

	toggleJanitorInBuilding(building: Building, user: SetUpUser) {
		let userIndex = building.janitorKeys.findIndex(key => key === user.key)
		if (userIndex > -1) {
			building.janitorKeys.splice(userIndex, 1)
		} else {
			building.janitorKeys.push(user.key)
		}
	}

	private newBuilding(): Building {
		return {
			address: null,
			floors: [this.newFloor()],
			janitorKeys: [],
			tempId: Date.now(),
			latitude: null,
			longitude: null,
			name: null
		}
	}

	private newFloor() {
		return {
			apartments: Array(10).fill(1).map((a, i) => {
				return { name: i + 1 + "", isOccupied: false }
			}),
			floorName: "A"
		}
	}

	toggleTable(table: HTMLDivElement) {
		if (table.style.display !== "block") {
			table.style.display = "block"
		} else {
			table.style.display = "none"
		}
	}

	getUnitsTootal(building: Building) {
		if (building.floors) {
			return building.floors.reduce((num, floor) => num + floor.apartments.length, 0)
		}
	}

	onFloorNumsChange(building: Building, num: number) {
		if (!/^\d+$/.test(num + "")) return alert('Only numbers are allowed');
		if (num < building.floors.length && confirm(`Are you sure you want to remove ${building.floors.length - num} floors?`)) {
			building.floors.splice(num, building.floors.length - num);
		} else {
			let from = building.floors.length;
			for (; from < num; from++) {
				building.floors.push(this.newFloor())
			}
		}
	}

	onAptsNumsChange(floor: {
		apartments: Array<{
			name: string,
			isOccupied: boolean
		}>
	}, num) {
		// if (!(/^\d+$/.test(num + ''))) return alert(`Only numbers are allowed`);
		// floor.apartments = [];
		// let currentFloor = floor.apartments[0];
		// for (; currentFloor <= floor.lastApt; currentFloor++) {
		// 	floor.apartments.push({ name: currentFloor });
		// }

		//TODO: implement
	}

	promptRemoveFloor(floor, aptIndex) {
		// let apt = floor.apts[aptIndex];
		// this.modalHeader = `Remove apartement ${apt.nameNumber} from floor ${floor.name}`
		// this.removeAptFunction = () => {
		// 	if (facility.key && apt.key) {
		// 		this.complexService.deleteApartment(apt.key)
		// 			.then(_ => { }, _ => { })
		// 	}
		// 	this.facilities[facilityIndex].floors[floorIndex].apts.splice(aptIndex, 1);
		// 	this.showModal = false;
		// }
		// this.showModal = true;
		//TODO: implement
	}

	// END OF BUILDINGS

	// AMENITIES

	defaultAmenitiesNames = Object.keys(DefaultAmenities).map(n => DefaultAmenities[n].name)
	defaultAmenitiesMap = DefaultAmenities
	activityModes = ActivityModes
	daylyTimes = Array(7).fill(1)
	days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

	toggleAmenities(facilityIndex) {
		if (this.facilities[facilityIndex].amenities.length === 0) {
			this.appendAmenity(this.facilities[facilityIndex])
		}
		let display = document.getElementById('amenities' + facilityIndex).style.display
		if (display !== "block") {
			document.getElementById('amenities' + facilityIndex).style.display = "block"
		} else {
			document.getElementById('amenities' + facilityIndex).style.display = "none"
		}
	}

	private newAmenity(): Amenity {
		return {
			buildings: [],
			directions: null,
			imagesUrl: [],
			janitorKeys: [],
			name: null,
			openingHours: this.generateAlwaysOpenOpeningHours(),
			rules: [],
			activityMode: ActivityModes.alwaysOpen,
			reservationRequired: true,
			timeLimitOption: true,
			timeLimit: 1,
			timeLimitUnit: "hours"
		}
	}

	toggleJanitorInAmenity(amenity: Amenity, user: SetUpUser) {
		if (amenity.janitorKeys) {
			let userIndex = amenity.janitorKeys.findIndex(key => key === user.key)
			if (userIndex > -1) {
				amenity.janitorKeys.splice(userIndex, 1)
			} else {
				amenity.janitorKeys.push(user.key)
			}
		} else {
			amenity.janitorKeys = [user.key]
		}
	}

	toggleBuildingInAmenity(amenity: Amenity, tempId: number) {
		let foundBuildingIndex = amenity.buildings.findIndex(bi => bi === tempId)
		if (foundBuildingIndex > -1) {
			amenity.buildings.splice(foundBuildingIndex, 1)
		} else {
			amenity.buildings.push(tempId)
		}
	}

	isBuildingSelected(amenity, tempId) {
		if (amenity.buildings) {
			return amenity.buildings.find(bi => bi === tempId) > -1
		}
	}

	appendAmenity(facility: Facility) {
		facility.amenities.push(this.newAmenity())
	}

	private generateAlwaysOpenOpeningHours() {
		return Array(7).fill(1).map((e, i) => {
			return {
				day: i + 1,
				fromHour: 0,
				fromMinute: 0,
				toHour: 23,
				toMinute: 59
			}
		})
	}

	setUseRegulations(amenity: Amenity, textarea: HTMLTextAreaElement) {
		amenity.rules = textarea.value.split('\n')
	}

	showAmenityImageSelection(facilityIndex, amenityIndex) {

	}

	// END OF AMENITIES

}

export interface Facility {
	key?: string,
	stripeConnectId?: string
	name: string,
	address: string,
	latitude: number,
	longitude: number,
	janitorKeys: Array<string>,
	locationManagerKeys: Array<string>,
	imageUrl: string,
	buildings: Array<Building>,
	amenities: Array<Amenity>
}

export interface Building {
	key?: string,
	tempId: number,
	name: string,
	address: string,
	latitude: number,
	longitude: number,
	janitorKeys: Array<string>
	floors: Array<{
		floorName: string,
		apartments: Array<{
			name: string,
			isOccupied: boolean
		}>
	}>
}

export interface Amenity {
	key?: string
	name: string,
	directions: string,
	janitorKeys: Array<string>
	buildings: Array<number> //index of building in the buildings array, because there is no key yet
	rules: Array<string>
	reservationRequired: boolean
	imagesUrl: Array<string>
	openingHours: Array<OpeningHours>
	activityMode: string
	timeLimitOption: boolean
	timeLimit: number
	timeLimitUnit: "hours" | "minutes"
}

export const ActivityModes = {
	alwaysOpen: "always_open",
	weeklySchedule: "weekly_schedule",
	dailySchedule: "daily_schedule"
}

export interface OpeningHours {
	day: number
	fromHour: number
	fromMinute: number
	toHour: number
	toMinute: number
}

export const DefaultAmenities = {
	"24hourMaintenance": { name: "24 Hour Maintenance", image: "/assets/img/amenities/24h Maintenance.svg" },
	"onlineRentPayment": { name: "On Line Rent Payment", image: "/assets/img/amenities/Rent payments.svg" },
	"bbqPicnicArea": { name: "BBQ Picnic Area", image: "/assets/img/amenities/BBQ.svg" },
	"businessCenter": { name: "Business Center", image: "/assets/img/amenities/Business Center.svg" },
	"concierge": { name: "Concierge", image: "/assets/img/amenities/Concierge.svg" },
	"controlledAccessGated": { name: "Controlled Access Gated", image: "/assets/img/amenities/Controlled Access.svg" },
	"coveredParking": { name: "Covered Parking", image: "/assets/img/amenities/Covered Parking.svg" },
	"fitnessCenter": { name: "Fitness Center", image: "/assets/img/amenities/Fitness Center.svg" },
	"garage": { name: "Garage", image: "/assets/img/amenities/Garage.svg" },
	"highSpeedWifiInCommonAreas": { name: "High Speed Wifi In CommonAreas", image: "/assets/img/amenities/High Speed Wifi.svg" },
	"onSiteMaintenance": { name: "On Site Maintenance", image: "/assets/img/amenities/Onsite  Maintenance.svg" },
	"petFriendly": { name: "Pet Friendly", image: "/assets/img/amenities/Pets Friendly.svg" },
	"pool": { name: "Pool", image: "/assets/img/amenities/Pool.svg" }
}