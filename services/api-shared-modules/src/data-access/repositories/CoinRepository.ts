import { Repository } from './Repository';
import { CoinItem } from '../../models/core/Coin';
import { ICoinRepository, QueryKey } from '../interfaces';
import { QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { Coin } from '../../external-apis/binance/binance.interfaces';
import { Entity } from '../../types/entities';

export class CoinRepository extends Repository implements ICoinRepository {

	public async getAll(userId: string): Promise<Coin[]> {
		const keyCondition: QueryKey = {
			entity: Entity.COIN,
			sk: `${Entity.USER}#${userId}`
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
			pk: `${Entity.COIN}#${coin.coin}`,
			sk: `${Entity.USER}#${userId}`,
			sk2: `${Entity.COIN}#${coin.coin}`,
			entity: Entity.COIN,
			...coin
		}));
	}

}
