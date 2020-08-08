export enum PublishType {
	QUERY = 'QUERY',
	INSERT = 'INSERT',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE'
}

export interface CollectionItem {
	[id: string]: any;
}

export type SubscriptionPayloadData = CollectionItem | CollectionItem[] | string;

export interface SubscriptionPayload {
	subscription: string | undefined;
	itemType: string;
	itemId: string;
	type: PublishType;
	isCollection: boolean;
	data: SubscriptionPayloadData;
	notice?: string;
}

export interface SubscriptionNotificationPayload {
	data: SubscriptionPayloadData;
}

export interface SubscriptionRequest {
	subscription: string;
	subscribe: boolean;
	userId: string;
}

export interface SubscriptionError {
	subscription?: string | undefined;
	error?: string;
}
