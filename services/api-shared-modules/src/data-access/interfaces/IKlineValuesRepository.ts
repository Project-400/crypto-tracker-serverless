import { KlineValues, VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types';

export interface IKlineValuesRepository {
	get(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<KlineValues>;
	getRange(userId: string, interval: VALUE_LOG_INTERVAL, limit: number): Promise<KlineValues[]>;
	create(userId: string, time: string, initValue: string, interval: VALUE_LOG_INTERVAL): Promise<KlineValues>;
	update(userId: string, changes: Partial<KlineValues>): Promise<KlineValues>;
}
