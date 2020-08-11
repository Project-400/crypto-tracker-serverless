import { PriceChangeStats } from '../../types';
import { Repository } from './Repository';
import { QueryKey, IPriceChangeStatsRepository } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { PriceChangeStatsItem } from '../../models/core';
import { v4 as uuid } from 'uuid';

export class PriceChangeStatsRepository extends Repository implements IPriceChangeStatsRepository {

	public async getAllPriceChangeStats(): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: 'priceChangeStats'
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index'
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async savePriceChangeStatsBatch(pcs: PriceChangeStats): Promise<PriceChangeStats> {
		const date: string = new Date().toISOString();
		const id: string = uuid();

		return this.db.put(Object.assign(new PriceChangeStatsItem(), {
			pk: `priceChangeStats#${id}`,
			sk: `symbol#${pcs.symbol}`,
			entity: 'priceChangeStats',
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pcs
		}));
	}

}
