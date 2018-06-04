import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store'

import { AppState } from '../../../store/appState'
import { ComplexService } from '../../../services/complex.service';
import { Observable } from "rxjs/Observable";
import { User } from "../../../store/user/user.interface";
import { DefaultAmenities } from "../../setup/facilities-details/facilities-details.component";



@Component({
	selector: 'facility-amenities',
	templateUrl: './facility-amenities.component.html',
	styleUrls: ['./facility-amenities.component.scss']
})

export class FacilityAmenitiesComponent implements OnInit {

	@select() user$: Observable<User>
	@Input() amenities = [];

	DefaultAmenities = DefaultAmenities

	showSelectAmenities = false;

	loading = false;

	constructor(private redux: NgRedux<AppState>, private complexService: ComplexService) {

	}

	ngOnInit() {

	}

	renderAmenityName(name) {
		return name.split('_').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' ')
	}

}