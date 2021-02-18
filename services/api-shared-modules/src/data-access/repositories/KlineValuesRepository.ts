import { KlineValues, VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types';
import { EntitySortType } from '../../types/entity-sort-types';
import { Repository } from './Repository';
import { Entity } from '../../types/entities';
import { IKlineValuesRepository } from '../interfaces/IKlineValuesRepository';
import { KlineValuesItem } from '../../models/core/KlineValues';

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

	public async create(userId: string, klineValues: Partial<KlineValues>): Promise<KlineValues> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new KlineValuesItem(), {
			pk: `${Entity.KLINE_VALUES}#${klineValues.time}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${klineValues.interval}/${EntitySortType.TIME}#${klineValues.time}`,
			sk2: `${Entity.KLINE_VALUES}#${klineValues.time}`,
			entity: Entity.KLINE_VALUES,
			isClosed: false,
			times: {
				createdAt: date
			},
			...klineValues
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
