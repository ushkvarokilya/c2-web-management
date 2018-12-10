import { Pipe, PipeTransform } from '@angular/core';

import * as moment from "moment";

@Pipe({
	name: 'dateRange'
})

export class DateRangePipe implements PipeTransform {

	transform(value: any, ...args: any[]): any {
		return this.preciseDiff(value)
	}

	STRINGS = {
		nodiff: '',
		year: 'year',
		years: 'years', 
		month: 'month',
		months: 'months',
		day: 'day',
		days: 'days',
		hour: 'hour',
		hours: 'hours',
		minute: 'minute',
		minutes: 'minutes',
		second: 'second',
		seconds: 'seconds',
		delimiter: ' '
	};

	pluralize(num, word) {
		return num + ' ' + this.STRINGS[word + (num === 1 ? '' : 's')];
	}

	buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff) {
		var result = [];

		if (yDiff) {
			result.push(this.pluralize(yDiff, 'year'));
		}
		if (mDiff) {
			result.push(this.pluralize(mDiff, 'month'));
		}
		if (dDiff) {
			result.push(this.pluralize(dDiff, 'day'));
		}
		// if (hourDiff) {
		// 	result.push(this.pluralize(hourDiff, 'hour'));
		// }
		// if (minDiff) {
		// 	result.push(this.pluralize(minDiff, 'minute'));
		// }
		// if (secDiff) {
		// 	result.push(this.pluralize(secDiff, 'second'));
		// }

		return result.join(this.STRINGS.delimiter);
	}

	preciseDiff(d) {
		var m1 = moment(), m2 = moment(d, 'ddd MMM DD HH:mm:ss zz YYYY'), firstDateWasLater;

		m1.add(m2.utcOffset() - m1.utcOffset(), 'minutes'); // shift timezone of m1 to m2

		if (m1.isSame(m2)) {
			return this.STRINGS.nodiff;
		}
		if (m1.isAfter(m2)) {
			var tmp = m1;
			m1 = m2;
			m2 = tmp;
			firstDateWasLater = true;
		} else {
			firstDateWasLater = false;
		}

		var yDiff = m2.year() - m1.year();
		var mDiff = m2.month() - m1.month();
		var dDiff = m2.date() - m1.date();
		var hourDiff = m2.hour() - m1.hour();
		var minDiff = m2.minute() - m1.minute();
		var secDiff = m2.second() - m1.second();

		if (secDiff < 0) {
			secDiff = 60 + secDiff;
			minDiff--;
		}
		if (minDiff < 0) {
			minDiff = 60 + minDiff;
			hourDiff--;
		}
		if (hourDiff < 0) {
			hourDiff = 24 + hourDiff;
			dDiff--;
		}
		if (dDiff < 0) {
			var daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();
			if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
				dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
			} else {
				dDiff = daysInLastFullMonth + dDiff;
			}
			mDiff--;
		}
		if (mDiff < 0) {
			mDiff = 12 + mDiff;
			yDiff--;
		}

		return this.buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff);
		
	}
}