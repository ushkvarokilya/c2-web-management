import { Action, ActionCreator } from 'redux';
import { Group, Message } from './messages.interface';

export const MessagesActionsNames = {
	LoadGroups: "[messages] load groups",
	UpdateSpecificGroups: "[messages] update specific groups",
	SetCurrentGroup: "[messages] set current group",
	SetCurrentGroupByParticipantOrInitNew: "[messages] set current group by participant or init new",
	UpdateCurrentGroupData: "[messages] update group data",
	UpdateCurrentGroupMessages: "[messages] update current group messages",
	SendMessage: "[messages] send message",
	CreateGroup: "[messages] create group",
	NewGroup: "[messages] new group"
}

export interface LoadGroups extends Action{
	groups: Group[]
}

export interface UpdateSpecificGroups extends Action{
	groups: Group[]
}

export interface SetCurrentGroup extends Action{
	groupKey: string
}

export interface SetCurrentGroupByParticipantOrInitNew extends Action{
	user: any
}

export interface UpdateCurrentGroupData extends Action{
	group: Group
}

export interface UpdateCurrentGroupMessages extends Action{
	messages: Message[]
}

export interface SendMessage extends Action{
	message: Message
}

export interface CreateGroup extends Action{
	group: Group
}

export const loadGroups: ActionCreator<LoadGroups> = (groups) => ({
	type: MessagesActionsNames.LoadGroups,
	groups
})

export const updateSpecificGroups: ActionCreator<UpdateSpecificGroups> = (groups) => ({
	type: MessagesActionsNames.UpdateSpecificGroups,
	groups
})

export const setCurrentGroup: ActionCreator<SetCurrentGroup> = (groupKey) => ({
	type: MessagesActionsNames.SetCurrentGroup,
	groupKey
})

export const setCurrentGroupByParticipantOrInitNew: ActionCreator<SetCurrentGroupByParticipantOrInitNew> = (user) => ({
	type: MessagesActionsNames.SetCurrentGroup,
	user
})

export const updateCurrentGroupData: ActionCreator<UpdateCurrentGroupData> = (group) => ({
	type: MessagesActionsNames.UpdateCurrentGroupData,
	group
})

export const updateCurrentGroupMessages: ActionCreator<UpdateCurrentGroupMessages> = (messages) => ({
	type: MessagesActionsNames.UpdateCurrentGroupMessages,
	messages
})

export const sendMessage: ActionCreator<SendMessage> = (message) => ({
	type: MessagesActionsNames.SendMessage,
	message
})

export const createGroup: ActionCreator<CreateGroup> = (group) => ({
	type: MessagesActionsNames.CreateGroup,
	group
})

export const newGroup: ActionCreator<any> = (participants?) => ({
	type: MessagesActionsNames.NewGroup,
	participants
})