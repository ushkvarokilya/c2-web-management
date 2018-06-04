import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store'
import * as RxJS from 'rxjs';

import { AppState } from '../../store/appState'
import { Company, Complex } from '../../store/company/company.interface'
import { ComplexService } from '../../services/complex.service';
import { FacilityCalendarComponent } from './facility-calendar/facility-calendar.component';
import { FacilityUnitsComponent } from './facility-units/facility-units.component';
import { FacilityAmenitiesComponent } from './facility-aminities/facility-amenities.component'

import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs/Observable';
import { User } from '../../store/user/user.interface';
import { updateCurrentComplexPhoto } from '../../store/company/company.ac';



@Component({
	selector: 'facility',
	templateUrl: './facility.component.html',
	styleUrls: ['./facility.component.scss']
})

export class FacilityPageComponent implements OnInit {

	company$: Observable<Company>;
	user$: Observable<User>;
	complexes$: Observable<Complex[]>;
	currentComplex$: Observable<Complex>;

	dataSubject: RxJS.Subject<any>
	dataLoaded;

	cloudinaryInit;

	buildings: Building[] = [];
	amenities = [];
	events = [];

	constructor(private redux: NgRedux<AppState>, private complexService: ComplexService) {
		this.dataSubject = new RxJS.Subject<any>();
	}

	ngOnInit() {

		this.company$ = this.redux.select(state => state.company)
		this.user$ = this.redux.select(state => state.user)
		this.complexes$ = this.redux.select((state: AppState) => state.company.complexes)
		this.currentComplex$ = this.redux.select((state: AppState) => state.company.currentComplex)

		this.company$.subscribe((company: Company) => {
			if (company.currentComplex !== null && company.complexes.length > 0 && !this.dataLoaded) {
				this.complexService.getFacilityOverview()
					.then((data: any) => {
						this.buildings = data.buildings || [];
						this.amenities = data.amenities || [];
						this.events = data.events || [];
						this.dataSubject.next(data);
						this.redux.dispatch(updateCurrentComplexPhoto(data.imageUrl))
					})
					.catch(e => e)
				this.dataLoaded = true;
			}
		})
	}

	imageUploaded(url: string) {
		this.complexService.updateComplexPhoto(url)
	}

}

interface Building {
	key?: string,
	floors: {
		name: string
		apartements: {
			key: string
			nameNumber: number
			occupancy: boolean
		}[]
	}[]
}