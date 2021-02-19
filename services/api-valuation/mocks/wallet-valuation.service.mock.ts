import { KlineValues, VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';

export const WalletValuation_GetExistingMinuteLog: WalletValuation = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	value: '500',
	time: '2021-02-19T11:16:00.000Z',
	interval: VALUE_LOG_INTERVAL.MINUTE,
	times: {
		createdAt: '2021-02-19T11:16:25.000Z'
	}
};

export const WalletValuation_CreateNewMinuteLog: WalletValuation = WalletValuation_GetExistingMinuteLog;

export const KlineValues_GetExistingHour: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T11:00:00.000Z',
	updateCount: 1,
	open: '100',
	lowest: '100',
	highest: '120',
	lastValue: '120',
	change: '20',
	changePercentage: '20',
	interval: VALUE_LOG_INTERVAL.HOUR,
	isClosed: false,
	times: {
		createdAt: '2021-02-19T11:00:25.000Z',
		valueStartingAt: '2021-02-19T11:00:00.000Z'
	}
};

export const KlineValues_GetExistingDay: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T00:00:00.000Z',
	updateCount: 1,
	open: '100',
	lowest: '100',
	highest: '100',
	lastValue: '100',
	change: '0',
	changePercentage: '0',
	interval: VALUE_LOG_INTERVAL.DAY,
	isClosed: false,
	times: {
		createdAt: '2021-02-19T00:00:25.000Z',
		valueStartingAt: '2021-02-19T00:00:00.000Z'
	}
};

export const KlineValues_UpdateExistingHour: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T11:00:00.000Z',
	updateCount: 2,
	open: '100',
	lowest: '100',
	highest: '120',
	lastValue: '120',
	change: '20',
	changePercentage: '20',
	interval: VALUE_LOG_INTERVAL.HOUR,
	isClosed: false,
	times: {
		createdAt: '2021-02-19T11:00:25.000Z',
		updatedAt: '2021-02-19T11:01:25.000Z',
		valueStartingAt: '2021-02-19T11:00:00.000Z'
	}
};

export const KlineValues_UpdateExistingDay: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T00:00:00.000Z',
	updateCount: 2,
	open: '100',
	lowest: '100',
	highest: '120',
	lastValue: '120',
	change: '20',
	changePercentage: '20',
	interval: VALUE_LOG_INTERVAL.DAY,
	isClosed: false,
	times: {
		createdAt: '2021-02-19T00:00:25.000Z',
		updatedAt: '2021-02-19T00:01:25.000Z',
		valueStartingAt: '2021-02-19T00:00:00.000Z'
	}
};

export const KlineValues_GetPreviousHour: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T10:00:00.000Z',
	updateCount: 1,
	open: '100',
	lowest: '100',
	highest: '100',
	lastValue: '100',
	change: '0',
	changePercentage: '0',
	interval: VALUE_LOG_INTERVAL.HOUR,
	isClosed: false,
	times: {
		createdAt: '2021-02-19T10:00:25.000Z',
		valueStartingAt: '2021-02-19T00:00:00.000Z'
	}
};

export const KlineValues_UpdatePreviousHour: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-19T10:00:00.000Z',
	updateCount: 2,
	open: '100',
	lowest: '100',
	highest: '120',
	lastValue: '120',
	change: '20',
	changePercentage: '20',
	interval: VALUE_LOG_INTERVAL.HOUR,
	isClosed: true,
	times: {
		createdAt: '2021-02-19T10:00:25.000Z',
		updatedAt: '2021-02-19T11:00:25.000Z',
		valueStartingAt: '2021-02-19T10:00:00.000Z',
		valueEndingAt: '2021-02-19T11:00:00.000Z'
	}
};

export const KlineValues_GetPreviousDay: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-18T00:00:00.000Z',
	updateCount: 1,
	open: '100',
	lowest: '100',
	highest: '100',
	lastValue: '100',
	change: '0',
	changePercentage: '0',
	interval: VALUE_LOG_INTERVAL.DAY,
	isClosed: false,
	times: {
		createdAt: '2021-02-18T00:00:25.000Z',
		valueStartingAt: '2021-02-18T00:00:00.000Z'
	}
};

export const KlineValues_UpdatePreviousDay: KlineValues = {
	pk: '',
	sk: '',
	sk2: '',
	entity: '',
	time: '2021-02-18T00:00:00.000Z',
	updateCount: 2,
	open: '100',
	lowest: '100',
	highest: '120',
	lastValue: '120',
	change: '20',
	changePercentage: '20',
	interval: VALUE_LOG_INTERVAL.DAY,
	isClosed: true,
	times: {
		createdAt: '2021-02-18T00:00:25.000Z',
		updatedAt: '2021-02-19T00:00:25.000Z',
		valueStartingAt: '2021-02-18T00:00:00.000Z',
		valueEndingAt: '2021-02-19T00:00:00.000Z'
	}
};

export const KlineValues_CreateNewHour: KlineValues = KlineValues_GetExistingHour;

export const KlineValues_CreateNewDay: KlineValues = KlineValues_GetExistingDay;
