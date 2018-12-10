import { Injectable } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AppHttpService } from './shared/http';
import { User } from '../store/user/user.interface';
import { AppState } from '../store/appState';
import * as MessagesActions from '../store/messages/messges.ac';
import { Messages, Message, Group } from '../store/messages/messages.interface';

import * as moment from 'moment';

@Injectable()
export class MessagingService {

	getMessagesNumber = 10;

	constructor(private http: AppHttpService, private redux: NgRedux<AppState>) {
	}

	getGroups() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key
		let managerKey = this.redux.getState().user.key
		return this.http.get(`/messaging/group/complex/${complexKey}/manager/${managerKey}`)
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'getGroups'))
			.then((data: any) => {
				if (data) {
					let groups: Group[] = data.items;
					this.redux.dispatch(MessagesActions.loadGroups(groups))
				}
				return Promise.resolve()
			})
	}
	//, Promise.reject
	
	getGroupMessages(groupKey, fromKey, amount) {
		return this.http.get(`/messaging/messages/group/${groupKey}/message/${fromKey}/amount/${amount}`)
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'getGroupMessages'));
	}

	loadAndSetCurrentGroup(groupKey) {
		this.redux.dispatch(MessagesActions.setCurrentGroup(groupKey))
		return this.getGroupMessages(groupKey, 0, this.getMessagesNumber)
			.then((data: any) => {
				let messages = data.items;
				if (!messages) messages = [];
				this.redux.dispatch(MessagesActions.updateCurrentGroupMessages(messages));
				return Promise.resolve()
			}), Promise.reject
	}

	setCurrentGroupByParticipant(user) {
		let groups = this.redux.getState().messages.groups;
		let group = groups.find(group => group.participants.length == 1 && group.participants[1].key === user.key)
		if (group) {
			this.loadAndSetCurrentGroup(group.key)
		} else {
			this.redux.dispatch(MessagesActions.newGroup([user]))
		}
	}

	newGroup(participants) {
		this.redux.dispatch(MessagesActions.newGroup(participants))
	}

	createGroup(group, message) {
		let managerKey = this.redux.getState().user.key
		let companyState = this.redux.getState().company
		if (!group.name || group.name.length == 0) {
			if (group.participants.length == 1) group.name = group.participants[0].name + ', Apt ' + group.participants[0].apartment
			else group.name = group.participants.reduce((s, p) => s += ` ${s.name}`, '').trim()
		}
		let toPost = {
			name: group.name,
			participants: group.participants.map(p => ({ key: p.key }))
		}
		return this.http.putPromisified(`/messaging/group/complex/${companyState.currentComplex.key}/manager/${managerKey}`, group)
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'createGroup'))
			.then((data: any) => {
				let key = data.key;
				group.key = key;
				this.redux.dispatch(MessagesActions.createGroup(group));
				this.sendMessage(message, key).then(() => { })
				return Promise.resolve()
			})
	}

	sendMessage(messageText, groupKey?) {
		let user = this.redux.getState().user;
		let msg: any = {
			dateSent: Date.now() + "",
			message: messageText
		}
		return this.http.putPromisified(`/messaging/send/group/${groupKey ? groupKey : this.redux.getState().messages.currentGroup.key}/manager`, msg)
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'sendMessage'))
			.then((data: any) => {
				msg.key = data.key
				msg.senderKey = user.key
				this.redux.dispatch(MessagesActions.sendMessage(msg));
				return Promise.resolve();
			})
	}

	loadMoreMessages() {
		let group = this.redux.getState().messages.currentGroup
		if (group.key) {
			let key = '0';
			if (group.messages[0]) key = group.messages[0].key
			this.getGroupMessages(group.key, key, this.getMessagesNumber)
				.then((data: any) => {
					let messages = data.items;
					if (messages) {
						this.redux.dispatch(MessagesActions.updateCurrentGroupMessages(messages))
					}
				})
		}
	}

	checkForNewMessages() {
		let group = this.redux.getState().messages.currentGroup
		if (group.key) {
			this.getGroupMessages(group.key, 0, this.getMessagesNumber)
				.then((data: any) => {
					let messages = data.items;
					if (messages) {
						this.redux.dispatch(MessagesActions.updateCurrentGroupMessages(messages))
					}
				})
		}
	}

	updateGroup(group) {
		this.redux.dispatch(MessagesActions.updateCurrentGroupData(group));
		let currentGroup = this.redux.getState().messages.currentGroup;
		currentGroup = Object.assign(currentGroup, { groupName: currentGroup.name });
		if (currentGroup.key) {
			this.http.postPromisified(`/messaging/group/${currentGroup.key}`, currentGroup)
				.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'updateGroup'))
				.then(() => { })
		}
	}

	addTenantToGroup(group, tenant) {
		this.redux.dispatch(MessagesActions.updateCurrentGroupData(group));
		let currentGroup = this.redux.getState().messages.currentGroup;
		if (currentGroup.key) {
			this.http.postPromisified(`/messaging/tenant/${tenant.key}/add/group/${currentGroup.key}`, currentGroup)
				.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'addTenantToGroup'))
				.then(() => { })
		}
	}

	removeTenantFromGroup(group, tenant) {
		this.redux.dispatch(MessagesActions.updateCurrentGroupData(group));
		let currentGroup = this.redux.getState().messages.currentGroup;
		if (currentGroup.key) {
			this.http.postPromisified(`/messaging/tenant/${tenant.key}/leave/group/${currentGroup.key}`, currentGroup)
				.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'removeTenantFromGroup'))
				.then(() => { })
		}
	}

	initMessages(isInterval) {
		this.getGroups()
			.then(() => {
				let firstGroup = this.redux.getState().messages.groups[0];
				if (firstGroup && !isInterval) return this.loadAndSetCurrentGroup(firstGroup.key)
			}, err => { })
			.then(() => { })
	}

	getWelcomeMessage() {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key
		return this.http.get(`/complex/${complexKey}/welcome`)
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'getWelcomeMessage'))
	}

	changeWelcomeMessage(message) {
		let companyState = this.redux.getState().company;
		let complexKey = companyState.currentComplex.key
		return this.http.postPromisified(`/complex/${complexKey}/welcome`, { message })
			.catch(err => this.http.commonCatchAndReject(err, 'MessagesService', 'changeWelcomeMessage'))
	}

}