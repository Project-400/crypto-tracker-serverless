// Preferably create a custom NPM package and move everything from this file to the package
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { ExchangeCurrencyFullDto } from '../external-apis/binance/binance.interfaces/exchange-currency.interfaces';

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

export interface PairPrice {
	symbol: string;
	price: number;
}

export interface PriceBatch {
	prices: PairPrice[];
	quote: string;
	times: {
		createdAt: Date | string;
	};
}

export interface PriceChangeStats {
	symbol: string; // Pair symbol
	base: string;
	quote: string;
	previousPrices: {
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
	pricePercentageChanges: {
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

export interface Transaction {
	request: TransactionRequest;
	response: ExchangeCurrencyFullDto;
	symbol: string;
	base: string;
	quote: string;
	completed: boolean;
	times: {
		createdAt: Date | string;
	};
}

export interface TransactionRequest {
	symbol: string;
	side: 'BUY' | 'SELL';
	quantity?: number;
	quoteOrderQty?: number;
	type: string;
}

export interface TransactionFill {
	price: number;
	qty: number;
	commission: number;
	commissionAsset: string;
	tradeId: number;
}

export enum ExchangeInfoRateLimiters {
	REQUEST_WEIGHT,
	ORDERS,
	RAW_REQUESTS
}
