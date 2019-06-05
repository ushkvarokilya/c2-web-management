import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchPayout' })

export class SearchPayoutPipe implements PipeTransform {
    transform(payouts, query) {
        if (!query || typeof query != "string" || query.length == 0) return payouts;
        else return payouts.filter(payout => {
            return this.isQueryContains(payout, query);
        });
    }

    isQueryContains(payout:
        {
            search: string[]
        },
        query: string) {
        let contains = payout.search.filter(v => v.includes(query)).length > 0;
        return contains;
    }
}