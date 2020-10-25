import { PairPrice } from '../../api-shared-modules/src/types';

export interface SeparatedPriceBatches {
	USDT: PairPrice[],
	BTC: PairPrice[],
	BNB: PairPrice[],
	ETH: PairPrice[],
	XRP: PairPrice[],
	BUSD: PairPrice[],
	TUSD: PairPrice[],
	USDC: PairPrice[],
	PAX: PairPrice[],
	EUR: PairPrice[],
	GBP: PairPrice[],
	OTHER: PairPrice[]
}
