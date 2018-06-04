import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterNameExist' })

export class FilterNameExistPipe implements PipeTransform {

	transform(available: { name: string }[], given: string[]) {
		if (!available || available.length == 0) return [];
		if (!given || given.length == 0) return [];
		return available.filter(item => {
			return given.includes(item.name.toLowerCase());
		})
	}

}