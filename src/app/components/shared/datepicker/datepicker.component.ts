import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import * as Pikaday from 'pikaday';

@Component({
	selector: 'datepicker',
	template: `<input class="datepicker" type="text"/>`,
	styleUrls: ['./datepicker.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class DatepickerComponent implements OnInit {

	@Input() height;
	@Input() width;
	@Input() format: string;
	@Input() date: string;
	@Input() historyDisabled: boolean;
	@Input() futureDisabled: boolean;
	@Input() isBirthDate: boolean;
	@Input() reposition: boolean;

	@Output() dateChange = new EventEmitter<string>();

	picker: any;

	constructor(private elRef: ElementRef) { }

	ngOnInit() {
		// this.elRef.nativeElement.style.position = "relative"
		let inputElement = this.elRef.nativeElement.getElementsByClassName('datepicker')[0]

		if (this.height) inputElement.style.height = this.height;
		if (this.width) {
			inputElement.style.width = this.width;
		}
		let pikadayProp: any = {
			field: inputElement,
			format: this.format || 'DD - MMM - YYYY',
			showMonthAfterYear: true,
			position: 'bottom left',
			reposition: this.reposition || false,
			// container: this.elRef.nativeElement,
			onSelect: () => {
				this.date = this.picker.getMoment().format(this.format || 'DD MMM YYYY');
				this.dateChange.emit(this.date);
			},
			// onOpen: () => {
			// 	let pickerElement = <HTMLDivElement>this.elRef.nativeElement.getElementsByClassName('pika-single')[0]
			// 	pickerElement.style.position = 'absolute';
			// 	pickerElement.style.left = '50%';
			// 	pickerElement.style.top = this.height || '38px';
			// }
		}
		if (this.isBirthDate) {
			pikadayProp.yearRange = [moment().subtract(120, 'year').year(), moment().year()]
			pikadayProp.maxDate = new Date()
		}
		if (this.historyDisabled) pikadayProp.minDate = new Date();
		if (this.futureDisabled) pikadayProp.maxDate = new Date();
		this.picker = new Pikaday(pikadayProp);
		if (this.date) this.picker.setDate(moment(this.date, this.format || 'DD MMM YYYY').format('YYYY-MM-DD'))
	}

}