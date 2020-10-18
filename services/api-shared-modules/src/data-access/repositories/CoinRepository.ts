import { Repository } from './Repository';
import { CoinItem } from '../../models/core/Coin';
import { ICoinRepository, QueryKey } from '../interfaces';
import { QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { Coin } from '../../external-apis/binance/binance.interfaces';
import { COIN, USER } from '../../types';

export class CoinRepository extends Repository implements ICoinRepository {

	public async getAll(userId: string): Promise<Coin[]> {
		const keyCondition: QueryKey = {
			entity: COIN,
			sk: `${USER}#${userId}`
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk-index'
		};

		const queryIterator: QueryIterator<CoinItem> = this.db.query(CoinItem, keyCondition, queryOptions);
		const coins: Coin[] = [];

		for await (const coin of queryIterator) coins.push(coin);

		return coins;

	}

	public async saveSingle(userId: string, coin: Coin): Promise<Coin> {
		return this.db.put(Object.assign(new CoinItem(), {
			pk: `${COIN}#${coin.coin}`,
			sk: `${USER}#${userId}`,
			sk2: `${COIN}#${coin.coin}`,
			entity: COIN,
			...coin
		}));
	}

}
