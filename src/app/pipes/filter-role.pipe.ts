import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterRoles' })

export class FilterRolesPipe implements PipeTransform {

	transform(roles: string[], input: string) {
		if(roles && input) {
			return roles.filter(role => role.toLowerCase().includes(input.toLowerCase()))
		} else {
			return roles
		}
	}

}