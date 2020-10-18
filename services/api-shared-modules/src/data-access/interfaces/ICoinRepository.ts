import { Coin } from '../../external-apis/binance/binance.interfaces';

export interface ICoinRepository {
	getAll(userId: string): Promise<Coin[]>;
	saveSingle(userId: string, coin: Coin): Promise<Coin>;
}
