import { Coin } from '../../external-apis/binance/binance.interfaces';

export interface ICoinRepository {
	getAllCoins(userId: string): Promise<Coin[]>;
	getSpecifiedCoins(userId: string, coinsNames: string[]): Promise<Coin[]>;
	create(userId: string, coin: Coin): Promise<Coin>;
}
