import { PriceChangeStats } from '../../types';
import { Repository } from './Repository';
import { QueryKey, IPriceChangeStatsRepository } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { PriceChangeStatsItem } from '../../models/core';

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

	public async getPriceChangeStatsByQuote(quote: string): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: 'priceChangeStats',
			sk2: `quote#${quote}`
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index'
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async getPriceChangeStatsByBase(base: string): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: 'priceChangeStats',
			sk3: `base#${base}`
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk3-index'
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async savePriceChangeStats(pcs: PriceChangeStats): Promise<PriceChangeStats> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new PriceChangeStatsItem(), {
			pk: `priceChangeStats#${pcs.symbol}`,
			sk: `symbol#${pcs.symbol}`,
			sk2: `quote#${pcs.quote}`,
			sk3: `base#${pcs.base}`,
			entity: 'priceChangeStats',
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pcs
		}));
	}

	public async update(id: string, changes: Partial<PriceChangeStats>): Promise<PriceChangeStats> {
		return this.db.update(Object.assign(new PriceChangeStatsItem(), {
			pk: `priceChangeStats#${changes.symbol}`,
			sk: `symbol#${changes.symbol}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
