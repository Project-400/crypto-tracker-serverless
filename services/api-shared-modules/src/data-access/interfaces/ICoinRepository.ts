import { Coin } from '../..';

export interface ICoinRepository {
	getAll(): Promise<Coin[]>;
	saveSingle(coin: Coin): Promise<Coin>;
}
