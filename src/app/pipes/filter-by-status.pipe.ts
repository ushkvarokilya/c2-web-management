import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterByStatus' })

export class FilterByStatusPipe implements PipeTransform {

	transform(tickets, status) {
		if (!status || typeof status != "string" || status.length == 0 || status === "All") return tickets;
		else return tickets.filter(ticket => ticket.status === status);
	}

}