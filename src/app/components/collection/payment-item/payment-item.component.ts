import { Component, OnInit, Input } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import * as moment from 'moment';

import { AppState } from '../../../store/appState';
import { Company } from '../../../store/company/company.interface'
import { ComplexService } from '../../../services/complex.service'
import { Observable } from "rxjs/Observable";
import { User } from "../../../store/user/user.interface";

interface oneTimePayment {
  title: string;
  cost: string;
  isTyping: boolean;
}
@Component({
  selector: 'payment-item',
  templateUrl: './payment-item.component.html',
  styleUrls: ['./payment-item.component.scss']
})

export class PaymentItemComponent implements OnInit {

  @select() company$;
  @select() user$: Observable<User>
  @Input() payment;

  dataLoaded;
  tooltip;
  moment = moment;
  expandPayment;
  showAddOneTimeCharge;
  currentPayment;
  formPayments: Array<oneTimePayment> = [{ title: "", cost: "", isTyping: false }];
  constructor(private redux: NgRedux<AppState>, private complexService: ComplexService) {
  }

  ngOnInit() {
  }

  markAsPaid() {
    this.formPayments.push({ title: "", cost: "", isTyping: false });
  }
  removePayment(payment: oneTimePayment) {
    if (this.formPayments.length > 1) {
      var index = this.formPayments.indexOf(payment, 0);
      if (index > -1) {
        this.formPayments.splice(index, 1);
      }
    }
  }
  addMonthlyCharges() {
    for (let payment of this.formPayments) {
      debugger;
      this.complexService.addOneTimePayment(payment.title, payment.cost, this.currentPayment.monthlyPaymentKey)
        .then((res: any) => {
          this.currentPayment.detailedPayments.push({
            id: res.id, monthlyChargeAmount: payment.cost, monthlyChargeName: payment.title, oneTimePayment: true
          });
        }, err => { });
    }
    this.showAddOneTimeCharge = false;
    this.formPayments = [{ title: "", cost: "", isTyping: false }];
  }
  deleteMonthlyCharge(subPayment: any, monthlyPaymentKey: number, payment) {
    this.complexService.removeOneTimePayment(subPayment.id, monthlyPaymentKey)
      .then((res: any) => {
        var index = payment.detailedPayments.indexOf(subPayment, 0);
        if (index > -1) {
          payment.detailedPayments.splice(index, 1);
        }
      }, err => { });
  }
  closeModal() {
    this.showAddOneTimeCharge = false;
    this.formPayments = [{ title: "", cost: "", isTyping: false }];
  }
  getPresentedDate(date) {
    return moment(+date).format('DD MMM YYYY')
  }

  typingTrue(payment: oneTimePayment) {
    payment.isTyping = true;
  }
  checkOverdue(overdue) {
    return true;
  }
}
