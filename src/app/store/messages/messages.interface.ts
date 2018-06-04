export interface Messages{
	groups: Group[],
	currentGroup: CurrentGroup,
	unreadCount: number;
}

export interface Group{
	name: string,
	participants: MessageTenant[],
	imageUrl?: string,
	lastMessage?: Message,
	managementKey?: string,
	lastMessageSentDate?: string,
	unreadCount?: number,
	key?: string
}

export interface Message{
	key: string,
	senderKey: string,
	senderName: string,
	senderPhoto: string,
	dateSent: string,
	message: string,
	attachmentUrl?: string,
}

export interface MessageTenant{
	name: string,
	apartment: string,
	imageUrl: string,
	key: string
}

export interface CurrentGroup extends Group{
	messages: Message[]
}

export const currentGroupInit: CurrentGroup = {
	name: null,
	participants: [],
	messages: [],
	lastMessage: null
}

export const messagesInit: Messages = {
	groups: [],
	currentGroup: currentGroupInit,
	unreadCount: 0
}

