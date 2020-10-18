import { ExchangePair } from '../../types';
import { Repository } from './Repository';
import { IExchangePairRepository, QueryKey } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { ExchangePairItem } from '../../models/core';
import { Entity } from '../../types/entities';
import { DBIndex } from '../../types/db-indexes';

export class ExchangePairRepository extends Repository implements IExchangePairRepository {

	public async getAllPairs(): Promise<ExchangePair[]> {
		const keyCondition: QueryKey = {
			entity: Entity.EXCHANGE_PAIR
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK
		};

		const queryIterator: QueryIterator<ExchangePairItem> = this.db.query(ExchangePairItem, keyCondition, queryOptions);
		const pairs: ExchangePairItem[] = [];
		for await (const pair of queryIterator) pairs.push(pair);

		return pairs;
	}

	public async getExchangePair(symbol: string, quote: string): Promise<ExchangePair> {
		return this.db.get(Object.assign(new ExchangePairItem(), {
			pk: `${Entity.EXCHANGE_PAIR}#${symbol}`,
			sk: `${Entity.EXCHANGE_PAIR}#${quote}`
		}));
	}

	public async saveExchangePair(pair: ExchangePair): Promise<ExchangePair> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangePairItem(), {
			pk: `${Entity.EXCHANGE_PAIR}#${pair.symbol}`,
			sk: `${Entity.EXCHANGE_PAIR}#${pair.quote}`,
			entity: Entity.EXCHANGE_PAIR,
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pair
		}));
	}

}
