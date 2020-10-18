import { PriceChangeStats } from '../../types';
import { Repository } from './Repository';
import { QueryKey, IPriceChangeStatsRepository } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { PriceChangeStatsItem } from '../../models/core';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';
import { DBIndex } from '../../types/db-indexes';

export class PriceChangeStatsRepository extends Repository implements IPriceChangeStatsRepository {

	public async getAllPriceChangeStats(): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: Entity.PRICE_CHANGE_STATS
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async getPriceChangeStatsByQuote(quote: string): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: Entity.PRICE_CHANGE_STATS,
			sk2: `${EntitySortType.QUOTE}#${quote}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK2
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async getPriceChangeStatsByBase(base: string): Promise<PriceChangeStats[]> {
		const keyCondition: QueryKey = {
			entity: Entity.PRICE_CHANGE_STATS,
			sk3: `${EntitySortType.BASE}#${base}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK3
		};

		const queryIterator: QueryIterator<PriceChangeStatsItem> = this.db.query(PriceChangeStatsItem, keyCondition, queryOptions);
		const priceChangeStats: PriceChangeStatsItem[] = [];
		for await (const stats of queryIterator) priceChangeStats.push(stats);

		return priceChangeStats;
	}

	public async savePriceChangeStats(pcs: PriceChangeStats): Promise<PriceChangeStats> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new PriceChangeStatsItem(), {
			pk: `${Entity.PRICE_CHANGE_STATS}#${pcs.symbol}`,
			sk: `${EntitySortType.SYMBOL}#${pcs.symbol}`,
			sk2: `${EntitySortType.QUOTE}#${pcs.quote}`,
			sk3: `${EntitySortType.BASE}#${pcs.base}`,
			entity: Entity.PRICE_CHANGE_STATS,
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pcs
		}));
	}

	public async update(id: string, changes: Partial<PriceChangeStats>): Promise<PriceChangeStats> {
		return this.db.update(Object.assign(new PriceChangeStatsItem(), {
			pk: `${Entity.PRICE_CHANGE_STATS}#${changes.symbol}`,
			sk: `${EntitySortType.SYMBOL}#${changes.symbol}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
