import { Reducer, Action } from 'redux';

import { Messages, currentGroupInit, messagesInit, Message, Group } from './messages.interface';
import * as MessagesActions from './messges.ac';
import { MessagesActionsNames } from './messges.ac';

let loadGroup = (state: Messages, action: MessagesActions.LoadGroups) => {
	if (!action.groups || !Array.isArray(action.groups)) return state;
	let unreadCount = action.groups.reduce((state, group) => state + group.unreadCount, 0);
	let newState = Object.assign({}, {
		groups: action.groups.sort((a: Group, b: Group) => +b.lastMessageSentDate - +a.lastMessageSentDate),
		currentGroup: currentGroupInit,
		unreadCount
	})
	return Object.assign({}, state, {
		groups: action.groups.sort((a: Group, b: Group) => +b.lastMessageSentDate - +a.lastMessageSentDate),
		// currentGroup: currentGroupInit,
		unreadCount
	})
}

let setCurrentGroup = (state: Messages, action: MessagesActions.SetCurrentGroup) => {
	let index = checkIfKeyThere(state.groups, action.groupKey);
	if (index != -1) {
		return Object.assign({}, state, { currentGroup: Object.assign({}, state.groups[index], { messages: [] }) });
	}
	else return state;
}

let setCurrentGroupByParticipantOrInitNew = (state: Messages, action: MessagesActions.SetCurrentGroupByParticipantOrInitNew) => {
	let group = getGroupByParticipantKey(state.groups, action.user)
	if (group) {
		return Object.assign({}, state, { currentGroup: Object.assign({}, group, { messages: [] }) });
	} else {
		return Object.assign({}, state, { currentGroup: Object.assign({}, currentGroupInit, { participancts: [action.user] }) })
	}
}

let updateSpecificGroups = (state: Messages, action: MessagesActions.UpdateSpecificGroups) => {
	let groups = state.groups;
	action.groups.forEach(newGroup => {
		let index = checkIfKeyThere(groups, newGroup.key)
		if (index != -1) groups.splice(-1, 1, newGroup)
		else return state;
	})
	groups.sort((a: Group, b: Group) => +b.lastMessageSentDate - +a.lastMessageSentDate)
	return Object.assign({}, state, { groups });
}

let updateCurrentGroupData = (state: Messages, action: MessagesActions.UpdateCurrentGroupData) => {
	let currentGroup = Object.assign({}, action.group, { messages: state.currentGroup.messages });
	state.groups.forEach(group => {
		if (group.key == action.group.key) {
			group.name = action.group.name;
		}
	})
	return Object.assign({}, state, { currentGroup })
}

let updateCurrentGroupMessages = (state: Messages, action: MessagesActions.UpdateCurrentGroupMessages) => {
	if (state.currentGroup.key == null) return state;
	let messagesToAdd = action.messages.filter(msg => {
		return msg.key && (checkIfKeyThere(state.currentGroup.messages, msg.key) == -1);
	})
	let messages = state.currentGroup.messages
		.concat(messagesToAdd)
		.sort((a: Message, b: Message) => +a.dateSent - +b.dateSent);
	let currentGroup = Object.assign({}, state.currentGroup, { messages });

	let index = checkIfKeyThere(state.groups, currentGroup.key);
	if (index !== -1) state.groups[index].unreadCount = 0;
	let unreadCount = state.groups.reduce((state, group) => state + group.unreadCount, 0);
	return Object.assign({}, state, { currentGroup, unreadCount });
}

let sendMessage = (state: Messages, action: MessagesActions.SendMessage) => {
	if (!state.currentGroup) return state;
	let currentGroup = state.currentGroup;
	currentGroup.messages.push(action.message);
	currentGroup.messages = currentGroup.messages.sort((a, b) => +a.dateSent - +b.dateSent)

	let index = checkIfKeyThere(state.groups, currentGroup.key);
	state.groups[index].lastMessage = action.message;
	state.groups[index].lastMessageSentDate = Date.now() + "";
	state.groups = state.groups.sort((a: Group, b: Group) => +b.lastMessageSentDate - +a.lastMessageSentDate)
	return Object.assign({}, state, { currentGroup });
}

let createGroup = (state: Messages, action: MessagesActions.CreateGroup) => {
	state.groups.push(action.group)
	let currentGroup = Object.assign({}, currentGroupInit, action.group)
	return Object.assign({}, state, { currentGroup });
}

let newGroup = (state: Messages, action: any) => {
	if (action.participants) {
		return Object.assign({}, state, { currentGroup: Object.assign({}, currentGroupInit, { participants: action.participants })})
	} else {
		return Object.assign({}, state, { currentGroup: currentGroupInit })
	}
}

function checkIfKeyThere(groups, key) {
	for (let index in groups) {
		let group = groups[index]
		if (group.key == key) return +index;
	}
	return -1;
}

function getGroupByParticipantKey(groups: Group[], key) {
	for (let group of groups) {
		if (group.participants.length == 1 && group.participants[0].key === key) {
			return group;
		}
	}
	return null;
}

export const messagesReducer: Reducer<Messages> = (state: Messages = messagesInit, action: any) => {
	switch (action.type) {
		case MessagesActionsNames.LoadGroups: return loadGroup(state, action)
		case MessagesActionsNames.SetCurrentGroup: return setCurrentGroup(state, action)
		case MessagesActionsNames.SetCurrentGroupByParticipantOrInitNew: return setCurrentGroupByParticipantOrInitNew(state, action)
		case MessagesActionsNames.UpdateSpecificGroups: return updateSpecificGroups(state, action)
		case MessagesActionsNames.UpdateCurrentGroupData: return updateCurrentGroupData(state, action)
		case MessagesActionsNames.UpdateCurrentGroupMessages: return updateCurrentGroupMessages(state, action)
		case MessagesActionsNames.SendMessage: return sendMessage(state, action)
		case MessagesActionsNames.CreateGroup: return createGroup(state, action)
		case MessagesActionsNames.NewGroup: return newGroup(state, action)
		default: return state;
	}
}