import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

import { AppState } from '../../store/appState';
import { Company } from '../../store/company/company.interface'
import { ComplexService } from '../../services/complex.service'
import { PaymentItemComponent } from './payment-item/payment-item.component';

@Component({
  selector: 'app200-collection-page',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionPageComponent implements OnInit {

  @select() company$;

  overdueCount;
  overdueSum;
  paidCount;
  paidSum;
  total;
  unpaidCount;
  unpaidSum;

  sortBy = "name";
  show = 'all';
  searchQuery = '';
  payments = [];

  itemsType = 0;
  loading
  dataLoaded;

  moment = moment;

  constructor(private redux: NgRedux<AppState>, private complexService: ComplexService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.company$.subscribe((company: Company) => {
      if (company.currentComplex !== null && company.complexes.length > 0 && !this.dataLoaded) {
        this.loading = true;
        this.complexService.getCollectionOverview()
          .then((data: any) => {
            this.loading = false;
            if (data) {
              for (let prop in data) this[prop] = data[prop]
              if (data.apartmentMonthlyPaymentModels) {
                this.payments = data.apartmentMonthlyPaymentModels;
              }
            }
          })
        this.dataLoaded = true;
      }
    })
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.searchQuery) this.searchQuery = params.searchQuery;
    })
  }

}
