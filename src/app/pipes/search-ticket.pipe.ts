import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchTicket' })

export class SearchTicketPipe implements PipeTransform {
  transform(tickets, query) {
		if (!query || typeof query != "string" || query.length == 0) return tickets;
    else return tickets.filter(ticket => {
			return this.isQueryContains(ticket, query);
		});
  }

	isQueryContains(ticket: 
	{ ticketNumber: number, apartementName: string, problemDescription: string, dateCreated: string, status: string, joinedPeople: { firstName: string, lastName: string }[] },
	query: string) {
		let contains = (ticket.ticketNumber + '').includes(query) ||
						(ticket.apartementName && ticket.apartementName.includes(query)) ||
						ticket.problemDescription.includes(query) ||
						new Date(ticket.dateCreated).toISOString().includes(query) ||
						ticket.joinedPeople.reduce((prev, tenant) => prev + ' ' + tenant.firstName + ' ' + tenant.lastName, '').includes(query)
		return contains;
	}
}