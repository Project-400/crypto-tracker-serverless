import { Repository } from './Repository';
import { CoinItem } from '../../models/core/Coin';
import { ICoinRepository, QueryKey } from '../interfaces';
import { QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { Coin } from '../../external-apis/binance/binance.interfaces';
import { Entity } from '../../types/entities';
import { DBIndex } from '../../types/db-indexes';
import { ConditionExpression, inList, MembershipExpressionPredicate } from '@aws/dynamodb-expressions';

export class CoinRepository extends Repository implements ICoinRepository {

	public async getAllCoins(userId: string): Promise<Coin[]> {
		const keyCondition: QueryKey = {
			entity: Entity.COIN,
			sk: `${Entity.USER}#${userId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK
		};

		const queryIterator: QueryIterator<CoinItem> = this.db.query(CoinItem, keyCondition, queryOptions);
		const coins: Coin[] = [];

		for await (const coin of queryIterator) coins.push(coin);

		return coins;
	}

	public async getSpecifiedCoins(userId: string, coinsNames: string[]): Promise<Coin[]> {
		const predicate: MembershipExpressionPredicate = inList(...coinsNames);

		const expression: ConditionExpression = {
			...predicate,
			subject: 'coin'
		};

		const keyCondition: QueryKey = {
			entity: Entity.COIN,
			sk: `${Entity.USER}#${userId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK,
			filter: expression
		};

		const queryIterator: QueryIterator<CoinItem> = this.db.query(CoinItem, keyCondition, queryOptions);
		const coins: Coin[] = [];

		for await (const coin of queryIterator) coins.push(coin);

		return coins;
	}

	public async create(userId: string, coin: Coin): Promise<Coin> {
		return this.db.put(Object.assign(new CoinItem(), {
			pk: `${Entity.COIN}#${coin.coin}`,
			sk: `${Entity.USER}#${userId}`,
			sk2: `${Entity.COIN}#${coin.coin}`,
			entity: Entity.COIN,
			...coin
		}));
	}

}
