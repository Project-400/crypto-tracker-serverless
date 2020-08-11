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

	};
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

export interface CoinNetwork {
	network: string;
	coin: string;
	withdrawIntegerMultiple: number;
	isDefault: boolean;
	depositEnable: boolean;
	withdrawEnable: boolean;
	depositDesc: string;
	withdrawDesc: string;
	specialTips: string;
	name: string;
	resetAddressStatus: boolean;
	addressRegex: string;
	memoRegex: string;
	withdrawFee: number;
	withdrawMin: number;
	withdrawMax: number;
	minConfirm: number;
	unLockConfirm: number;
}

export interface Coin {
	coin: string;
	depositAllEnable: boolean;
	withdrawAllEnable: boolean;
	name: string;
	free: number;
	locked: number;
	freeze: number;
	withdrawing: number;
	ipoing: number;
	ipoable: number;
	storage: number;
	isLegalMoney: boolean;
	trading: boolean;
	networkList: CoinNetwork[];
}

export interface PairPrice {
	symbol: string;
	price: number;
}

export interface PriceBatch {
	prices: PairPrice[];
	base: string;
	times: {
		createdAt: Date | string;
	};
}

export interface PriceChangeStats {
	symbol: string; // Pair symbol
	prices: {
		min5: number;
		min10: number;
		min30: number;
		hour: number;
		hour3: number;
		hour6: number;
		hour12: number;
		hour24: number;
	};
	priceChanges: {
		min5: number;
		min10: number;
		min30: number;
		hour: number;
		hour3: number;
		hour6: number;
		hour12: number;
		hour24: number;
	};
	currentPrice: number;
	times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};
}

export interface ExchangePair {
	symbol: string;
	base: string;
	quote: string;
	times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};
}

export interface BinanceExchangeInfoSymbol {
	symbol: string;
	baseAsset: string;
	quoteAsset: string;
}

export interface BinanceExchangeInfoResponse {
	symbols: BinanceExchangeInfoSymbol[];
}
