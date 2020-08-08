import { Coin } from '../../types';
import { Repository } from './Repository';
import { ICoinRepository } from '../interfaces/ICoinRepository';
import { CoinItem } from '../../models/core/Coin';

export class CoinRepository extends Repository implements ICoinRepository {

	// public async getAll(): Promise<Coin[]> {
	// }

	public async saveAll(coin: Coin): Promise<Coin> {
		return this.db.get(Object.assign(new CoinItem(), {
			pk: `coin#${coin.coin}`,
			sk: `coin#${coin.coin}`,
			...coin
		}));
	}

}
