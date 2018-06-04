import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';

import { Reservation } from "../components/amenity/amenity.component";
import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';

@Injectable()
export class AmenityService {

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	getAmenity(amenityKey) {
		return this.http.get(`/amenity/${amenityKey}`)
			.catch(err => console.error('AmenityService: error while getAmenity', err));
	}

	publishAnnouncement(amenityKey, announcement: AnnouncementSentToServer) {
		if (announcement.scheduled) {
			announcement.startDate = announcement.startDate.toString()
			announcement.endDate = announcement.endDate.toString()
		}
		return this.http.postPromisified(`/amenity/${amenityKey}/announcement`, announcement)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'publishAnnouncement'))
	}

	editAnnouncement(amenityKey, announcementKey, announcement: AnnouncementSentToServer) {
		if (announcement.scheduled) {
			announcement.startDate = announcement.startDate.toString()
			announcement.endDate = announcement.endDate.toString()
		}
		return this.http.putPromisified(`/amenity/${amenityKey}/announcement/${announcementKey}`, announcement)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'editAnnouncement'))
	}

	deleteAnnouncement(amenityKey, announcementKey) {
		return this.http.deletePromisified(`/amenity/${amenityKey}/announcement/${announcementKey}`)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'deleteAnnouncement'))
	}

	addAmenityReservation(amenityKey: string, reservation: Reservation) {
		if (reservation.fullDay) {
			delete reservation.startDate
			delete reservation.endDate
		}
		return this.http.postPromisified(`/amenity/${amenityKey}/reserve`, reservation)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'addAmenityReservation'))
	}

	getAmenityReservation(amenityKey, year, month) {
		return this.http.get(`/amenity/${amenityKey}/reservation/year/${year}/month/${month}`)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'getAmenityReservation'))
	}

	deleteReservation(reservationKey) {
		return this.http.postPromisified(`/reservation/${reservationKey}/delete`, '')
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'deleteReservation'))
	}

	editReservation(reservation: Reservation) {
		return this.http.putPromisified(`/reservation/${reservation.key}`, reservation)
			.catch(err => this.http.commonCatchAndReject(err, 'AmenityService', 'editReservation'))
	}

}

interface AnnouncementSentToServer { message: string, startDate: number | string, endDate: number | string, scheduled: boolean }