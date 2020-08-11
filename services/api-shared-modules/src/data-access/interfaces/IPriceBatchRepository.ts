import { PairPrice, PriceBatch } from '../..';

export interface IPriceBatchRepository {
	getPriceBatches(time: string): Promise<PriceBatch[]>;
	savePriceBatch(prices: PairPrice[], base: string): Promise<PriceBatch>;
}
