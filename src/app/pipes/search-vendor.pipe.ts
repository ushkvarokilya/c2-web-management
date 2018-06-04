import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchVendors' })

export class SearchVendorsPipe implements PipeTransform {
  transform(vendors, query) {
		if (!query || typeof query != "string" || query.length == 0) return vendors;
    else return vendors.filter(vendor => {
			return this.isQueryContains(vendor, query);
		});
  }

	isQueryContains(vendor: { name: string, professions: string[], phoneNumber: string, email: string, address: string }, query: string) {
		let inVendorProfessions = vendor.professions && Array.isArray(vendor.professions) && 
															vendor.professions.reduce((prev, prof) => prev || prof.includes(query), false)
		let contains = 
			(vendor.name && vendor.name.includes(query)) ||
			(vendor.professions && vendor.professions.includes(query)) ||
			(vendor.phoneNumber && vendor.phoneNumber.includes(query)) ||
			(vendor.email && vendor.email.includes(query)) ||
			(inVendorProfessions) ||
			(vendor.address && vendor.address.includes(query));
		return contains;
	}
}