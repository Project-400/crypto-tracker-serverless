import { Coin } from '../../types';
import { Repository } from './Repository';
import { CoinItem } from '../../models/core/Coin';
import { ICoinRepository, QueryKey } from '../interfaces';
import { QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';

export class CoinRepository extends Repository implements ICoinRepository {

	public async getAll(): Promise<Coin[]> {
		const keyCondition: QueryKey = {
			entity: 'coin'
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index'
		};

		const queryIterator: QueryIterator<CoinItem> = this.db.query(CoinItem, keyCondition, queryOptions);
		const coins: Coin[] = [];

		for await (const coin of queryIterator) coins.push(coin);

		return coins;

	}

	public async saveSingle(coin: Coin): Promise<Coin> {
		return this.db.put(Object.assign(new CoinItem(), {
			pk: `coin#${coin.coin}`,
			sk: `coin#${coin.coin}`,
			entity: 'coin',
			...coin
		}));
	}

}
