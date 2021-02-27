import { KlineValues, VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types';
import { EntitySortType } from '../../types/entity-sort-types';
import { Repository } from './Repository';
import { Entity } from '../../types/entities';
import { IKlineValuesRepository } from '../interfaces/IKlineValuesRepository';
import { KlineValuesItem } from '../../models/core/KlineValues';
import { QueryKey } from '../interfaces';
import { beginsWith } from '@aws/dynamodb-expressions';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { DBIndex } from '../../types/db-indexes';

export class KlineValuesRepository extends Repository implements IKlineValuesRepository {

	public async get(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<KlineValues> {
		try {
			return await this.db.get(Object.assign(new KlineValuesItem(), {
				pk: `${Entity.KLINE_VALUES}#${roundedTime}`,
				sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}/${EntitySortType.TIME}#${roundedTime}`
			}));
		} catch (e) {
			return undefined;
		}
	}

	public async getRange(userId: string, interval: VALUE_LOG_INTERVAL, limit: number): Promise<KlineValues[]> {
		const keyCondition: QueryKey = {
			entity: Entity.KLINE_VALUES,
			// sk: between(
			// 	`${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}/${EntitySortType.TIME}#${startTime}`,
			// 	`${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}/${EntitySortType.TIME}#${endTime}`
			// )
			sk: beginsWith(`${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}`)
		};

		console.log(`${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}`);

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK,
			scanIndexForward: false,
			limit
		};

		const queryIterator: QueryIterator<KlineValues> = this.db.query(KlineValuesItem, keyCondition, queryOptions);
		const pairs: KlineValues[] = [];
		for await (const pair of queryIterator) pairs.push(pair);

		return pairs;
	}

	public async create(userId: string, time: string, initValue: string, interval: VALUE_LOG_INTERVAL): Promise<KlineValues> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new KlineValuesItem(), {
			pk: `${Entity.KLINE_VALUES}#${time}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}/${EntitySortType.TIME}#${time}`,
			sk2: `${Entity.KLINE_VALUES}#${time}`,
			entity: Entity.KLINE_VALUES,
			time,
			open: initValue,
			lowest: initValue,
			highest: initValue,
			lastValue: initValue,
			change: '0',
			changePercentage: 0,
			interval,
			isClosed: false,
			updateCount: 1,
			times: {
				createdAt: date,
				valueStartingAt: time
			}
		}));
	}

	public async update(userId: string, changes: Partial<KlineValues>): Promise<KlineValues> {
		delete changes.sk2;
		delete changes.sk3;

		changes.times.updatedAt = new Date().toISOString();

		return this.db.update(Object.assign(new KlineValuesItem(), {
			pk: `${Entity.KLINE_VALUES}#${changes.time}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${changes.interval}/${EntitySortType.TIME}#${changes.time}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
