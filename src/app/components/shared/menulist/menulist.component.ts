import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import * as moment from 'moment';
import * as Pikaday from 'pikaday';

@Component({
	selector: 'menulist',
	template: `<div class="menulist">
							<ng-content></ng-content>
							<div class="arrow-front"></div>
							<div class="arrow-back"></div>
						</div>`,
	styleUrls: ['./menulist.component.scss']
})

export class MenulistComponent implements OnInit {

	@Input() arrowDirection: string = "top";
	@Input() arrowSize: string = "7px";
	@Input() arrowPosition: string = "50%";

	menuElement: HTMLDivElement;

	constructor(private elRef: ElementRef) { }

	ngOnInit() {
		this.menuElement = <HTMLDivElement>this.elRef.nativeElement.getElementsByClassName('menulist')[0];
		let arrowFront = this.menuElement.getElementsByClassName('arrow-front')[0]
		let arrowBack = this.menuElement.getElementsByClassName('arrow-back')[0]
		switch(this.arrowDirection){
			case 'top':
				
			case 'bottom':
			case 'right':
			case 'left':
		}
	}

}