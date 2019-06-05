import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as Moment from 'moment';

import { AppState } from '../../store/appState';
import { User } from '../../store/user/user.interface';
import { Company } from '../../store/company/company.interface';
import { ComplexService } from '../../services/complex.service';

import { environment } from "../../../environments/environment";
import { DatePipe } from '@angular/common';
import { Http, Response, Headers } from '@angular/http';

@Component({
  selector: 'payouts-page',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss']
})

export class PayoutsComponent implements OnInit {

  @select() user$: Observable<User>
  @select() company$: Observable<Company>

  searchQuery;
  showBy = "All";
  sortBy = "dateTimePaid$";

  show = "Location Manager";
  // show = "Janitor"

  dataLoaded;
  accountingServer = environment.accounting_api_endpoint;
  complex;

  payouts = [];
  statuses = {
    paid: "Paid",
    pending: "Pending",
    in_transit: "In Transit",
    canceled: "Canceled",
    failed: "Failed"
  }
  payoutLable  = {
    payout : "Payout"
  }
  canMerge;
  mergeTickets;
  mainMessage;

  constructor(
    private redux: NgRedux<AppState>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private complexService: ComplexService,
    private http: Http,
  ) {

  }

  ngOnInit() {
    if (this.redux.getState().user.isJanitor) {
      this.show = "Janitor"
    }
    this.user$.subscribe(user => {
      if (user.isJanitor) {
        this.show = "Janitor"
      } else {
        this.show = "Location Manager"
      }
    })

    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && !this.dataLoaded) {
        this.complex = company.currentComplex;
        this.LoadPayouts();
        this.dataLoaded = true;
      }
    })
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.searchQuery) this.searchQuery = params.searchQuery
    })
  }

  moment(date = Date.now()) {
    return Moment(+date)
  }

  LoadPayouts() {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    headers.append('Authorization', 'Bearer ' + this.redux.getState().user.token);
    this.http.get(this.accountingServer + 'Payouts/' + this.complex.code, { headers: headers })
      .subscribe((res: Response) => {
        this.payouts = res.json();
        this.payouts = this.payouts.map(payout => {
          payout.selected = false;
          payout.showDetails = false;
          payout.dateTimePaid = new Date(payout.dateTimePaid);
          return payout;
        });
        console.log(this.payouts);
      });
  }




}