import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchTenant' })

export class SearchTenantstPipe implements PipeTransform {

	transform(leases, query) {
		if (!query || typeof query != "string" || query.length == 0 || !leases) return leases;
		return leases.filter(lease => this.isQueryContains(lease, query.toLocaleLowerCase()));
	}

	isQueryContains(lease: { apartment: string, tenants: any[] }, query: string) {
		let contains =
			(lease.apartment && lease.apartment.toLocaleLowerCase().includes(query)) ||
			(lease.tenants && lease.tenants.map(t => `${t.firstName} ${t.lastName}`).join(' ').toLocaleLowerCase().includes(query))
		return contains;
	}
}