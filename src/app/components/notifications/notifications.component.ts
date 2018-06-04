import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { AppState } from '../../store/appState';
import { Day } from '../../store/notifications/notifications.interface';

@Component({
	selector: 'notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit {

	@select(['notifications', 'days']) notificationsDays$: Observable<Day[]>;

	moment = moment;

	constructor(private router: Router, private redux: NgRedux<AppState>) { }

	ngOnInit() {
	}

	goto(type) {
		switch(type){
			case "collections_paid":
			case "collections_due":
				this.router.navigate(["collection"]);
				break;
			case "tickets":
				this.router.navigate(["maintenance"]);
				break;
			case "calendar":
			case "facility":
				this.router.navigate(["facility"]);
				break;
			case "vendor":
				this.router.navigate(["vendors"]);
				break;
			case "welcome":
				this.router.navigate(["overview"]);
				break;
			case "tenants":
				this.router.navigate(["tenants"]);
				break;
			default: 
		}
	}

	getPresentableDate(date){
		date = moment(+date);
		if(date.isSame(new Date(), 'day')) return 'Today';
		else return date.format('DD MMM YY')
	}
}