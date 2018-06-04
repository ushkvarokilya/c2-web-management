import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterLease'
})

export class FilterLeasePipe implements PipeTransform {
	transform(leases: any, args: string): any {
		let type = args
		if(!leases || !Array.isArray(leases)) return leases
		return leases.filter(lease => {
			if(type === 'archived'){
				return lease.archived
			}else if(type === 'active'){
				return !lease.archived
			}else return true
		})
	}
}