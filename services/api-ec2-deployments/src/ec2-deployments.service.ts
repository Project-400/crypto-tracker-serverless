import { UnitOfWork } from '../../api-shared-modules/src/data-access';

export interface CoinCount {
	coin: string;
	coinCount: number;
	usdValue?: string;
	isNonMainstream?: boolean; // If the coin does not have a BTC, ETH, USDT, BUSD or BNB trading pair
	individualValues?: {
		usdtValue?: string;
		busdValue?: string;
		btcValue?: string;
		ethValue?: string;
		bnbValue?: string;
	};
	totalValues?: {
		usdtTotalValue?: string;
		busdTotalValue?: string;
		btcToUsdTotalValue?: string;
		ethToUsdTotalValue?: string;
		bnbToUsdTotalValue?: string;
		btcTotalValue?: string;
		ethTotalValue?: string;
		bnbTotalValue?: string;
	};
}

export interface PairPriceList {
	[symbol: string]: string;
}

export class Ec2DeploymentsService {

	public constructor(
		private unitOfWork: UnitOfWork,
	) { }

	public getValuation = async (coinCounts: CoinCount[]): Promise<CoinCount[]> => {

	}

}
