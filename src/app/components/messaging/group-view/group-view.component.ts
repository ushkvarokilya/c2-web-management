import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable, Subject } from 'rxjs';
import * as Moment from 'moment';
import { AppState } from '../../../store/appState';
import { User } from '../../../store/user/user.interface';
import { Company } from '../../../store/company/company.interface';
import { CurrentGroup } from '../../../store/messages/messages.interface';
import { MessagingService } from '../../../services/messaging.service';
import { StringValidationService } from '../../../services/string-validation.service';



@Component({
  selector: 'group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.scss']
})

export class GroupViewComponent implements OnInit, OnDestroy {

  @Input() group: CurrentGroup;
  @Input() company: Company;

  @select() user$: Observable<User>;

  myKey: string;

  showTenants;
  focusOnTenant;

  isShowAddParticipant;
  addParticipantText

  sendMessageText;

  isLoadingMoreMessages;

  sendingMessage;

  refreshMessageInterval;

  constructor(
    private redux: NgRedux<AppState>, 
    private messagesService: MessagingService,
    private stringValidation: StringValidationService
  ) {
    this.myKey = redux.getState().user.key
  }

  ngOnInit() {
    let conversationElemnt = <HTMLDivElement>document.getElementsByClassName('conversation')[0]

    conversationElemnt.onscroll = () => {
      if (conversationElemnt.scrollTop === 0) {
        this.isLoadingMoreMessages = true;
        this.messagesService.loadMoreMessages();
      }
    }

    let observer = new MutationObserver((mutations) => {
      if (this.isLoadingMoreMessages) this.isLoadingMoreMessages = false;
      else this.scrollConversationToBottom();
    });
    let config = { attributes: true, childList: true, characterData: true };
    observer.observe(conversationElemnt, config);

    this.refreshMessageInterval = setInterval(() => {
      this.messagesService.checkForNewMessages();
    }, 3000);

  }

  ngOnDestroy() {
    clearInterval(this.refreshMessageInterval)
  }

  showAddParticipant() {
    this.isShowAddParticipant = true;
    setTimeout(() => {
      document.getElementById('addParticipantInput').focus();
    })
  }

  toggleTenantsList(show) {
    setTimeout(() => {
      if (!this.focusOnTenant) this.showTenants = show;
    }, 200)
  }

  addTenant(tenant) {
    this.group.participants.push(tenant);
    this.messagesService.addTenantToGroup(this.group, tenant)
    this.addParticipantText = "";
    this.showTenants = false;
    this.focusOnTenant = false;
  }

  removeTenant(tenantIndex) {
    let tenant = this.group.participants.splice(tenantIndex, 1)[0];
    this.messagesService.removeTenantFromGroup(this.group, tenant);
  }

  sendMessage() {
    if (this.sendMessageText && this.sendMessageText.length > 0) {
      if (this.group.key) {
        this.sendingMessage = true;
        this.messagesService.sendMessage(this.sendMessageText)
          .then(() => {
            delete this.sendMessageText;
            this.sendingMessage = false;
          }, err => {
            this.sendingMessage = false;
          })
      } else if ((this.group.participants.length > 1 && this.group.name && this.group.name.length > 0) || this.group.participants.length == 1) {
        this.sendingMessage = true;
        this.messagesService.createGroup(this.group, this.sendMessageText)
          .then(() => {
            delete this.sendMessageText;
            this.sendingMessage = false;
          }, err => {
            this.sendingMessage = false;
          })
      }
    }
  }

  scrollConversationToBottom() {
    let conversationElem = <HTMLDivElement>document.getElementsByClassName('conversation')[0];
    conversationElem.scrollTop = conversationElem.scrollHeight;
  }

  updateGroup() {
    this.messagesService.updateGroup(this.group);
  }

  isMessageAttachementVideo(url) {
    return this.stringValidation.isValidMP4File(url)
  }

}
