import { Coin } from '../../external-apis/binance/binance.interfaces';

export interface ICoinRepository {
	getAll(userId: string): Promise<Coin[]>;
	create(userId: string, coin: Coin): Promise<Coin>;
}
