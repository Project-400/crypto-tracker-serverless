import { Coin } from '../..';

export interface ICoinRepository {
	// getAll(): Promise<Coin[]>;
	saveAll(coins: Coin): Promise<Coin>;
}
