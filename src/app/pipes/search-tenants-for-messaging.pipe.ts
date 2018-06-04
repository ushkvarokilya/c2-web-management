import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchTenantsForMessaging' })

export class SearchTenantsForMessagingPipe implements PipeTransform {

	transform(array: { key: string, name: string, apartment: string }[], query, participants: { key: string, name: string, apartment: string }[]) {
		let toReturn = array;
		if (participants && participants.length > 0) {
			toReturn = [];
			for (let tenant of array) {
				if (participants.findIndex(p => p.key == tenant.key) == -1) toReturn.push(tenant);
			}
		}
		if (query && typeof query == "string" && query.length > 0) {
			toReturn = toReturn.filter(item => {
				return item.name.toLowerCase().includes(query.toLowerCase()) || item.apartment.toLowerCase().includes(query.toLowerCase())
			})
		}
		return toReturn.sort((a, b) => {
			if (a.apartment < b.apartment) return -1;
			if (a.apartment > b.apartment) return 1;
			return 0;
		});
	}

}