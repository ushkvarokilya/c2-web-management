import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';

import { AppState } from '../../store/appState';
import { User } from '../../store/user/user.interface';
import { Company } from '../../store/company/company.interface';
import { Group, CurrentGroup } from '../../store/messages/messages.interface';
import { loadGroups, setCurrentGroup, newGroup } from '../../store/messages/messges.ac';
import { MessagingService } from '../../services/messaging.service';

@Component({
  selector: 'messaging-page',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})

export class MessagingComponent implements OnInit {

  user$: Observable<User>;
  groups$: Observable<Group[]>
  currentGroupKey$: Observable<string>
  currentGroup$: Observable<CurrentGroup>
  company$: Observable<Company>

  searchQuery

  changeGroup$: Subject<boolean>;

  showAutoGroup;
  showWelcomeMessage;

  autoGroupType = 1;

  loading;
  welcomeMessageError
  welcomeMessage

  moment = moment;

  constructor(private redux: NgRedux<AppState>, private messagesService: MessagingService) {
    this.changeGroup$ = new Subject<boolean>()
  }

  ngOnInit() {

    this.user$ = this.redux.select(state => state.user)
    this.groups$ = this.redux.select((state: AppState) => state.messages.groups)
    this.currentGroupKey$ = this.redux.select((state: AppState) => state.messages.currentGroup.key)
    this.currentGroup$ = this.redux.select((state: AppState) => state.messages.currentGroup)
    this.company$ = this.redux.select(state => state.company)

    this.changeGroup$.next(true);

  }

  setCurrentGroup(groupKey) {
    if (groupKey != this.redux.getState().messages.currentGroup.key) {
      this.messagesService.loadAndSetCurrentGroup(groupKey)
      this.changeGroup$.next(true);
    }
  }

  getDisplayDate(date: string) {
    let now = Date.now();
    let momentDate = moment(parseInt(date));
    if (momentDate.isSame(now, 'day')) return momentDate.format('hh:mm A')
    else if (momentDate.isSame(now, 'week')) return momentDate.format('ddd hh:mm A')
    else if (momentDate.isSame(now, 'year')) return momentDate.format('MMM Do hh:mm A')
    else return momentDate.format('MMM Do YYYY')
  }

  newGroup() {
    this.redux.dispatch(newGroup());
  }

  openWelcomeMessageDialog() {
    this.showWelcomeMessage = true
    this.messagesService.getWelcomeMessage()
      .then((data: any) => {
        this.welcomeMessage = data.welcomeMessage
      })
  }

  changeWelcomeMessage() {
    this.loading = true;
    delete this.welcomeMessageError;
    this.messagesService.changeWelcomeMessage(this.welcomeMessage)
      .then(() => {
        this.showWelcomeMessage = false
        this.loading = false
      }, err => {
        this.loading = false
        this.welcomeMessageError = err;
      })
  }
}
