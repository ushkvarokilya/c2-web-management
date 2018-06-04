import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'searchAnnouncement' })

export class SearchAnnouncementPipe implements PipeTransform {
  
	transform(announcements, query) {
		if (!query || typeof query != "string" || query.length == 0) return announcements;
    else return announcements.filter(announcement => {
			return this.isQueryContains(announcement, query);
		});
  }

	isQueryContains(announcement: any, query: string) {
		let contains = 
						(announcement.publisher && announcement.publisher.toUpperCase().includes(query.toUpperCase())) ||
						(announcement.message && announcement.message.toUpperCase().includes(query.toUpperCase())) ||
						(announcement.scheduled.from && moment(+announcement.scheduled.from).format('DD MMM YY').toUpperCase().includes(query.toUpperCase())) ||
						(announcement.scheduled.to && moment(+announcement.scheduled.to).format('DD MMM YY').toUpperCase().includes(query.toUpperCase()))
		return contains;
	}
}