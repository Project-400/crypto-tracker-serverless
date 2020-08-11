import { ExchangePair } from '../../types';
import { Repository } from './Repository';
import { IExchangePairRepository, QueryKey } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { ExchangePairItem } from '../../models/core';

export class ExchangePairRepository extends Repository implements IExchangePairRepository {

	public async getAllPairs(): Promise<ExchangePair[]> {
		const keyCondition: QueryKey = {
			entity: 'exchangePair'
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index'
		};

		const queryIterator: QueryIterator<ExchangePairItem> = this.db.query(ExchangePairItem, keyCondition, queryOptions);
		const pairs: ExchangePairItem[] = [];
		for await (const pair of queryIterator) pairs.push(pair);

		return pairs;
	}

	public async saveExchangePair(pair: ExchangePair): Promise<ExchangePair> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangePairItem(), {
			pk: `exchangePair#${pair.symbol}`,
			sk: `exchangePair#${pair.quote}`,
			entity: 'exchangePair',
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pair
		}));
	}

}
