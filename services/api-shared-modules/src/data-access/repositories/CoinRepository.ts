import { Coin } from '../../types';
import { Repository } from './Repository';
import { CoinItem } from '../../models/core/Coin';
import { ICoinRepository } from '../interfaces';

export class CoinRepository extends Repository implements ICoinRepository {

	// public async getAll(): Promise<Coin[]> {
	// }

	public async saveSingle(coin: Coin): Promise<Coin> {
		return this.db.put(Object.assign(new CoinItem(), {
			pk: `coin#${coin.coin}`,
			sk: `coin#${coin.coin}`,
			...coin
		}));
	}

}
