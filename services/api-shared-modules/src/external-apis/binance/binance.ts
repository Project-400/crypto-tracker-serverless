import BinanceEndpoints, { BinanceEndpoint } from './binance.endpoints';
import { HttpApi } from '../http-api';
import { BINANCE_API_KEY } from '../../../../../environment/env';
import { Coin, GetSymbolPriceDto } from './binance.interfaces';
import { Trade } from '@crypto-tracker/common-types';

export default class BinanceApi {

	private static headers: { [key: string]: string } = {
		'X-MBX-APIKEY': BINANCE_API_KEY
	};

	private static BinanceData = (params?: any): any =>
		({
			timestamp: new Date().getTime(),
			recvWindow: 2000,
			...params
		})

	public static async GetAllCoins(): Promise<Coin[]> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_ALL_COINS, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	public static async GetSymbolTrades(symbol: string): Promise<Trade[]> {
		const data: any = BinanceApi.BinanceData({ symbol });
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_SYMBOL_TRADES, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	public static async GetSymbolPrice(symbol: string): Promise<number> {
		const url: string = BinanceEndpoints.GetSymbolPrice(symbol);

		const data: GetSymbolPriceDto = JSON.parse(await HttpApi.get(url, BinanceApi.headers));

		if (!data.price || !data.price) throw Error('Failed to retrieve Symbol Price');

		return Number(data.price);
	}

}
