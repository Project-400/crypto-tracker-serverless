// Preferably create a custom NPM package and move everything from this file to the package

export type UserType = 'User' | 'Admin';

export interface DBItem {
	pk: string;
	sk: string;
	sk2?: string;
	sk3?: string;
	entity: string;
}

export interface UserConnection {
	deviceId: string;
	connectionId: string;
	connectedAt: string;
}

export interface User extends DBItem {
	userId: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	email: string;
	userType: UserType;
	confirmed: boolean;
	times: {
		confirmedAt?: string;
		createdAt: Date | string;
		lastLogin?: Date | string;

	},
	connections: UserConnection[]; // Websocket connection ids (can be connected to multiple at same time)
}

export interface Subscription extends DBItem {
	connectionId: string;
	subscriptionId: string;
	itemType: string;
	itemId: string;
	deviceId: string;
	userId?: string;
	times: {
		subscribedAt: string;
	};
}
