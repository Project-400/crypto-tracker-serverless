import { PairPrice, PriceBatch } from '../../types';
import { Repository } from './Repository';
import { PriceBatchItem } from '../../models/core';
import { IPriceBatchRepository, QueryKey } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class PriceBatchRepository extends Repository implements IPriceBatchRepository {

	public async getPriceBatches(time: string): Promise<PriceBatch[]> {
		const keyCondition: QueryKey = {
			entity: Entity.PRICE_BATCH,
			sk: `${EntitySortType.CREATED_AT}#${time}`
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index'
		};

		const queryIterator: QueryIterator<PriceBatchItem> = this.db.query(PriceBatchItem, keyCondition, queryOptions);
		const batches: PriceBatchItem[] = [];
		for await (const batch of queryIterator) {
			batches.push(batch);
		}

		return batches;
	}

	public async savePriceBatch(prices: PairPrice[], quote: string): Promise<PriceBatch> {
		const millis: number = 1000 * 60 * 5;
		const date: Date = new Date();
		const rounded: string = new Date(Math.round(date.getTime() / millis) * millis).toISOString();

		return this.db.put(Object.assign(new PriceBatchItem(), {
			pk: `${Entity.PRICE_BATCH}#${quote}`,
			sk: `${EntitySortType.CREATED_AT}#${rounded}`,
			entity: Entity.PRICE_BATCH,
			times: {
				createdAt: date
			},
			prices,
			quote
		}));
	}

}
