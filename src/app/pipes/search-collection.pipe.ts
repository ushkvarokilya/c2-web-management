import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchCollection' })

export class SearchCollectionPipe implements PipeTransform {
	transform(payments, query) {
		if (!query || typeof query != "string" || query.length == 0) return payments;
		else {
			if (payments){
				return payments.filter(payment => {
					return this.isQueryContains(payment, query);
				});
			}
		}
	}

	isQueryContains(payment: { name: string, tenants: any[] }, query: string) {
		let contains =
			payment.name.toLowerCase().includes(query.toLowerCase()) ||
			payment.tenants.map(t => t.fullName.toLowerCase()).join(' ').includes(query.toLowerCase())
		return contains;
	}
}