import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sortByPipe'
})

export class SortByPipe implements PipeTransform {
	transform(value: any[], prop: string): any {
		
		if(!value || value.length == 0 || !prop || prop.length == 0) return value;
		
		let ascend = false;

		if(prop.endsWith('$')){
			prop = prop.substring(0, prop.length - 1);
			ascend = true;
		}

		let toReturn = value.sort((a: any, b: any) => {
			if(!a.hasOwnProperty(prop)) return -1;
			if(!b.hasOwnProperty(prop)) return 1;

			let aValue = a[prop];
			let bValue = b[prop];
			if (aValue < bValue) return -1;
			if (aValue > bValue) return 1;
			return 0;
		})

		if (ascend) toReturn.reverse();
		return toReturn;

	}
}