import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { GetAllSymbolPricesDto, GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';

export interface CoinCount {
	coin: string;
	coinCount: number;
	btcCoinValue?: string;
	usdCoinValue?: string;
	btcTotalValue?: string;
	usdtTotalValue?: string;
	busdTotalValue?: string;
	btcToUsdTotalValue?: string;
	bnbToUsdTotalValue?: string;
}

export class ValuationService {

	public constructor(
		private unitOfWork: UnitOfWork,
		private exchangeInfoService: ExchangeInfoService
	) { }

	public getValuation = async (coinCounts: CoinCount[]): Promise<CoinCount[]> => {
		const symbolPricesDto: GetAllSymbolPricesDto = await BinanceApi.GetAllSymbolPrices();
		const nonTradingPairs: string[] = await this.exchangeInfoService.getNonTradingPairs();
		// const exchangeInfoDto: GetExchangeInfoDto = await BinanceApi.GetExchangeInfo();

		const prices: { [symbol: string]: string } = { };

		symbolPricesDto.filter((symbolPriceDto: GetSymbolPriceDto) =>
			nonTradingPairs.indexOf(symbolPriceDto.symbol) <= -1
		).map((symbolPriceDto: GetSymbolPriceDto) => {
			prices[symbolPriceDto.symbol] = symbolPriceDto.price;
		});

		// nonTradingPairs.map((notTradingSymbol: string) => {
		// 	if (notTradingSymbol === 'DOGEBNB') console.log(notTradingSymbol);
		// 	// if (exchangeInfoSymbol.symbol === 'DOGEBTC') console.log(exchangeInfoSymbol);
		// });

		const BTCUSDT_Price: string = prices.BTCUSDT;
		const BNBBUSD_Price: string = prices.BNBBUSD;

		return coinCounts.map((coinCount: CoinCount): CoinCount => {
			const usdtPrice: string = prices[`${coinCount.coin}USDT`];
			const busdPrice: string = prices[`${coinCount.coin}BUSD`];
			const btcPrice: string = prices[`${coinCount.coin}BTC`];
			const bnbPrice: string = prices[`${coinCount.coin}BNB`];

			return {
				...coinCount,
				usdtPrice,
				busdPrice,
				btcPrice,
				bnbPrice,
				// usdCoinValue: Number(prices[coinCount.symbol]),
				usdtTotalValue: `${coinCount.coinCount * Number(usdtPrice)}`,
				busdTotalValue: `${coinCount.coinCount * Number(busdPrice)}`,
				btcToUsdTotalValue: this.btcToUsd(`${coinCount.coinCount * Number(btcPrice)}`, BTCUSDT_Price),
				bnbToUsdTotalValue: this.bnbToUsd(`${coinCount.coinCount * Number(bnbPrice)}`, BNBBUSD_Price),
				// nonTradingPairs
			};
		};
	}

	private btcToUsd = (btcValue: string, btcUsdtPrice: string): string => `${Number(btcUsdtPrice) * Number(btcValue)}`;
	private bnbToUsd = (bnbValue: string, bnbUsdtPrice: string): string => `${Number(bnbUsdtPrice) * Number(bnbValue)}`;

}
