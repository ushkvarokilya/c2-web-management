import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

@Component({
	selector: 'page-not-fount',
	templateUrl: './page-not-found.component.html'
})
export class PageNotFoundComponent implements OnInit {

	constructor(private router: Router) { }

	ngOnInit() {
		// if (environment.isProd) {
		// 	location.href = "/";
		// } else {
			this.router.navigate(['overview']);
		// }
	}
}