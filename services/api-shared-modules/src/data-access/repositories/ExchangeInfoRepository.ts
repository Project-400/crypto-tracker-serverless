import { ExchangeInfo, ExchangePair } from '../../types';
import { Repository } from './Repository';
import { IExchangeInfoRepository } from '../interfaces';
import { ExchangeInfoItem } from '../../models/core/ExchangeInfo';

export class ExchangeInfoRepository extends Repository implements IExchangeInfoRepository {

	// public async saveExchangeInfo(): Promise<ExchangeInfo[]> {
	// 	const keyCondition: QueryKey = {
	// 		entity: 'exchangeInfo'
	// 	};
	//
	// 	const queryOptions: QueryOptions = {
	// 		indexName: 'entity-sk-index'
	// 	};
	//
	// 	const queryIterator: QueryIterator<ExchangePairItem> = this.db.query(ExchangePairItem, keyCondition, queryOptions);
	// 	const pairs: ExchangePairItem[] = [];
	// 	for await (const pair of queryIterator) pairs.push(pair);
	//
	// 	return pairs;
	// }

	public async getExchangeInfo(symbol: string, quote: string): Promise<ExchangeInfo> {
		return this.db.get(Object.assign(new ExchangeInfoItem(), {
			pk: `exchangeInfo#${symbol}`,
			sk: `exchangeInfo#${quote}`
		}));
	}

	public async saveExchangeInfo(pair: ExchangePair): Promise<ExchangeInfo> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangeInfoItem(), {
			pk: `exchangeInfo#${pair.symbol}`,
			sk: `exchangeInfo#${pair.quote}`,
			entity: 'exchangeInfo',
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pair
		}));
	}

}
