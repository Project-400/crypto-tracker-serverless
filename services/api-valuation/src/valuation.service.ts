import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { GetAllSymbolPricesDto, GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';

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

export class ValuationService {

	public constructor(
		private unitOfWork: UnitOfWork,
		private exchangeInfoService: ExchangeInfoService
	) { }

	public getValuation = async (coinCounts: CoinCount[]): Promise<CoinCount[]> => {
		const prices: PairPriceList = await this.getSymbolPrices();
		const nonMainstreamPairs: string[] = await this.exchangeInfoService.getNonMainstreamPairs();
		const BTCUSDT_Price: string = prices.BTCUSDT;
		const ETHUSDT_Price: string = prices.ETHUSDT;
		const BNBBUSD_Price: string = prices.BNBUSDT;

		return coinCounts.map((coinCount: CoinCount): CoinCount => {
			const usdtPrice: string = prices[`${coinCount.coin}USDT`];
			const busdPrice: string = prices[`${coinCount.coin}BUSD`];
			const btcPrice: string = prices[`${coinCount.coin}BTC`];
			const ethPrice: string = prices[`${coinCount.coin}ETH`];
			const bnbPrice: string = prices[`${coinCount.coin}BNB`];

			const cc: CoinCount = {
				...coinCount,
				individualValues: {
					usdtValue: usdtPrice,
					busdValue: busdPrice,
					btcValue: btcPrice,
					ethValue: ethPrice,
					bnbValue: bnbPrice
				},
				totalValues: { }
			};

			if (usdtPrice) cc.totalValues.usdtTotalValue = `${coinCount.coinCount * Number(usdtPrice)}`;
			if (busdPrice) cc.totalValues.busdTotalValue = `${coinCount.coinCount * Number(busdPrice)}`;
			if (btcPrice) {
				cc.totalValues.btcTotalValue = `${coinCount.coinCount * Number(btcPrice)}`;
				cc.totalValues.btcToUsdTotalValue = this.btcToUsd(`${coinCount.coinCount * Number(btcPrice)}`, BTCUSDT_Price);
			}
			if (ethPrice) {
				cc.totalValues.ethTotalValue = `${coinCount.coinCount * Number(ethPrice)}`;
				cc.totalValues.ethToUsdTotalValue = this.ethToUsd(`${coinCount.coinCount * Number(ethPrice)}`, ETHUSDT_Price);
			}
			if (bnbPrice) {
				cc.totalValues.bnbTotalValue = `${coinCount.coinCount * Number(bnbPrice)}`;
				cc.totalValues.bnbToUsdTotalValue = this.bnbToUsd(`${coinCount.coinCount * Number(bnbPrice)}`, BNBBUSD_Price);
			}

			cc.isNonMainstream = nonMainstreamPairs.indexOf(coinCount.coin) > -1;

			return this.setUsdValue(cc);
		});
	}

	private getSymbolPrices = async (): Promise<PairPriceList> => {
		const symbolPricesDto: GetAllSymbolPricesDto = await BinanceApi.GetAllSymbolPrices();
		const nonTradingPairs: string[] = await this.exchangeInfoService.getNonTradingPairs();
		const prices: { [symbol: string]: string } = { };

		symbolPricesDto.filter((symbolPriceDto: GetSymbolPriceDto) =>
			nonTradingPairs.indexOf(symbolPriceDto.symbol) <= -1 // Remove non-trading pairs
		).map((symbolPriceDto: GetSymbolPriceDto) => {
			prices[symbolPriceDto.symbol] = symbolPriceDto.price;
		});

		return prices;
	}

	private btcToUsd = (btcValue: string, btcUsdtPrice: string): string => `${Number(btcUsdtPrice) * Number(btcValue)}`;

	private ethToUsd = (ethValue: string, ethUsdtPrice: string): string => `${Number(ethUsdtPrice) * Number(ethValue)}`;

	private bnbToUsd = (bnbValue: string, bnbUsdtPrice: string): string => `${Number(bnbUsdtPrice) * Number(bnbValue)}`;

	private setUsdValue = (coinCount: CoinCount): CoinCount => {
		coinCount.usdValue =
			coinCount.totalValues.busdTotalValue ||
			coinCount.totalValues.usdtTotalValue ||
			coinCount.totalValues.btcToUsdTotalValue ||
			coinCount.totalValues.bnbToUsdTotalValue;

		return coinCount;
	}
}
