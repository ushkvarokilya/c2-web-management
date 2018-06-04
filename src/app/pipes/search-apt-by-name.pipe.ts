import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchAptByName' })

export class SearchAptByNamePipe implements PipeTransform {
	transform(array, query) {
		if (!query || typeof query != "string" || query.length == 0) return array;
		else return array.filter((item: any) => {
			return item.name.includes(query);
		});
	}
}