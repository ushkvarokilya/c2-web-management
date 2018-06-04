import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store'

import { AppState } from '../../../store/appState'
import { ComplexService } from '../../../services/complex.service';
import { Observable } from "rxjs/Observable";
import { User } from "../../../store/user/user.interface";

import { environment } from "../../../../environments/environment";



@Component({
	selector: 'facility-units',
	templateUrl: './facility-units.component.html',
	styleUrls: ['./facility-units.component.scss'],
	host: {
		'(document:click)': 'onDocumentClick($event)',
	}
})

export class FacilityUnitsComponent implements OnInit {

	@select() user$: Observable<User>
	@Input() buildings: Building[]
	@Input() dataSubject

	units: UnitType[] = [];

	choosenFloor = 0;

	amenities = [
		{ name: "air_conditioning", image: '/assets/img/air_condition.png' },
		{ name: "cables", image: '/assets/img/cables.png' },
		{ name: "balcony", image: '/assets/img/balcony.png' },
		{ name: "heating", image: '/assets/img/heating.png' },
		{ name: "accessibility", image: '/assets/img/accessabily.png' },
		{ name: "water_heater", image: '/assets/img/water_heater.png' },
		{ name: "washing_machine", image: '/assets/img/washing_machine.png' },
		{ name: "hot_tub", image: '/assets/img/hot_tub.png' },
		{ name: "cooking_gas", image: '/assets/img/cooking_icon.png' },
		{ name: "dryer", image: '/assets/img/dryer.png' }]

	Object = Object;

	selectedBuilding: Building

	loading;

	constructor(private redux: NgRedux<AppState>, private complexService: ComplexService) {

	}

	ngOnInit() {
		this.dataSubject.subscribe((data) => {
			if (data.units) {
				data.units.forEach(unit => {
					let amenities = {};
					if (unit.amenities) {
						for (let a of unit.amenities) {
							amenities[a] = true;
						}
					}
					unit.amenities = amenities;
					unit.apartments = unit.apartmentKeys || []

				})
				this.units = data.units
			}
			if (data.buildings) {
				this.buildings = data.buildings
			}
		})
	}

	private assignOccupiedApt(aptKey) {
		// this.buildings.forEach(building => {
		// 	let apt = floor.apartments.find(apt => apt.key === aptKey)
		// 	if (apt) apt.occupancy = true;
		// })
	}

	addUnit() {
		let newUnit: UnitType = {
			name: "",
			apartments: [],
			bedrooms: 1,
			bathrooms: 1,
			size: "",
			planImageUrl: "",
			amenities: {},
			edit: true
		}
		this.units.splice(0, 0, newUnit)
	}

	openChoosePlanImage(unitIndex) {
		(<HTMLButtonElement>document.getElementById(`unitInput${unitIndex}`).getElementsByClassName('cloudinary_fileupload')[0]).click()
	}

	renderAmenityName(name) {
		let renderedName = name.split('_')
			.map((n: string) =>
				n.charAt(0).toUpperCase() + n.slice(1)
			)
			.join(' ')
		switch (renderedName) {
			case "Cables":
				renderedName = "Cable ready"
				break
			case "Washing Machine":
				renderedName = "Washer hookup"
				break
			case "Dryer":
				renderedName = "Dryer Hookup"
				break
			case "Hot Tub":
				renderedName = "Bathtub"
				break
		}
		return renderedName
	}

	toggleEditUnit(unitIndex) {
		this.units[unitIndex].edit = true;
		let unit = this.units[unitIndex]
	}

	closeEditUnit(unit: UnitType) {
		unit.edit = false
		if (!unit.key) {
			let unitIndex = this.units.findIndex(u => u.key === unit.key)
			this.units.splice(unitIndex, 1)
		}
	}

	private copyFloors(floors) {
		let newArray = [];
		floors.forEach(floor => {
			let apartments = [];
			floor.apartments.forEach(apt => {
				apartments.push({
					key: apt.key,
					nameNumber: apt.nameNumber,
					occupancy: apt.occupancy
				})
			})
			newArray.push({
				name: floor.name,
				apartments: apartments
			})
		})
		return newArray;
	}

	openShowAptMatch(unit) {
		unit.showMatchApt = true;
	}

	toggleApt(unit: UnitType, apt) {
		let aptIndex = unit.apartments.findIndex(k => k === apt.key)
		if (aptIndex > -1) {
			unit.apartments.splice(aptIndex, 1)
		} else {
			unit.apartments.push(apt.key)
		}
	}

	isBuildingChoosen(unit: UnitType, building: Building) {
		for (let floor of building.floors) {
			if (this.isFloorChoosen(unit, floor)) {
				return true
			}
		}
		return false
	}

	isFloorChoosen(unit: UnitType, floor: Floor) {
		for (let key of unit.apartments) {
			if (floor.apartments.findIndex(apt => apt.key === key) > -1) {
				return true
			}
		}
		return false
	}

	isAptInUnit(unit: UnitType, apt: Apartment) {
		return unit.apartments.findIndex(key => key === apt.key) > -1
	}

	selectWholeFloor(unitIndex: number, floor: Floor) {
		let unit = this.units[unitIndex]
		floor.apartments.forEach(apt => {
			if (!this.isAptInUnit(unit, apt) && !this.isAptInOtherUnit(apt, unitIndex)) {
				unit.apartments.push(apt.key)
			}
		})
	}

	isWholeFloorSelected(unit: UnitType, floor: Floor) {
		for (let apt of floor.apartments) {
			if (!this.isAptInUnit(unit, apt)) return false
		}
		return true
	}

	isAptInOtherUnit(apt, unitIndex) {
		for (let i = 0; i < this.units.length; i++) {
			if (i !== unitIndex) {
				let unit = this.units[i]
				if (this.isAptInUnit(unit, apt)) return true
			}
		}
		return false
	}

	saveUnit(unitIndex) {
		let unit: UnitType = this.units[unitIndex];
		if (!unit.name || unit.name == "") return;
		if (!unit.size || unit.size == "") return;

		(() => {
			this.loading = true;
			if (!this.units[unitIndex].key) {
				return this.complexService.addUnit(this.units[unitIndex])
			} else {
				return this.complexService.updateUnit(this.units[unitIndex].key, this.units[unitIndex])
			}
		}).bind(this)()
			.then((data: any) => {
				if (data && data.key) {
					this.units[unitIndex].key = data.key;
				}
				this.loading = false;
				this.units[unitIndex].edit = false;
				unit.apartments.slice().map(key => { key }).forEach(this.assignOccupiedApt.bind(this))
			}, err => { })
	}

	deletUnit(unitIndex) {
		this.loading = true;
		this.complexService.deleteUnit(this.units[unitIndex].key)
			.then(() => {
				this.units[unitIndex].edit = false;
				let unitDeleteKey = this.units.splice(unitIndex, 1)[0].key;
				this.loading = false;
			})
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

	clickSelectAmenity(amenity, unit) {
		if (unit.amenities[amenity.name]) {
			delete unit.amenities[amenity.name]
		}
		else {
			unit.amenities[amenity.name] = true;
		}
	}

}

export interface UnitType {
	key?: string
	name: string
	apartments: string[]
	planImageUrl: string
	bedrooms: number
	bathrooms: number
	amenities: any
	size: string
	edit: boolean
	buildings?: Building[]
}

interface Apartment {
	key: string
	nameNumber: string
	occupancy: boolean
}

interface Floor {
	name: string
	apartments: Apartment[]
}

interface Building {
	key: string
	name: string
	floors: Floor[]
}