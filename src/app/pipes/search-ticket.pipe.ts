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
	{ ticketNumber: number, MaintenanceAddress: string, TicketTitle: string, TicketDate: string, status: string, joinedPeople: { firstName: string, lastName: string }[] },
	query: string) {
		let contains = (ticket.ticketNumber + '').includes(query) ||
						(ticket.MaintenanceAddress && ticket.MaintenanceAddress.includes(query)) ||
						ticket.TicketTitle.includes(query) ||
						new Date(ticket.TicketDate).toISOString().includes(query) 
		return contains;
	}
	// ||
	//ticket.joinedPeople.reduce((prev, tenant) => prev + ' ' + tenant.firstName + ' ' + tenant.lastName, '').includes(query)
}