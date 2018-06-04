import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterVendorProfession' })

export class FilterVendorProfessionPipe implements PipeTransform {
  transform(vendors, profession) {
		if (!profession || typeof profession != "string" || profession.length == 0) return vendors;
    else return vendors.filter(vendor => {
			return vendor.professions.includes(profession);
		});
  }
}