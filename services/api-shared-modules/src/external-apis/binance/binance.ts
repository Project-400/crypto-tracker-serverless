import BinanceEndpoints, { BinanceEndpoint } from './binance.endpoints';
import { HttpApi } from '../http-api';
import { BINANCE_API_KEY } from '../../../../../environment/env';
import { GetAllCoinsDto, GetDustLogsDto, GetSymbolPriceDto } from './binance.interfaces';
import { Trade } from '@crypto-tracker/common-types';
import { GetExchangeInfoDto } from './binance.interfaces/get-exchange-info.interfaces';

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

	public static async GetAllCoins(): Promise<GetAllCoinsDto> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_ALL_COINS, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	public static async GetSymbolTrades(symbol: string): Promise<Trade[]> {
		const data: any = BinanceApi.BinanceData({ symbol });
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_SYMBOL_TRADES, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	public static async GetSymbolPrice(symbol: string): Promise<GetSymbolPriceDto> {
		const url: string = BinanceEndpoints.GetSymbolPrice(symbol);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	public static async GetDustLogs(): Promise<GetDustLogsDto> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_DUST_LOGS, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* Current exchange trading rules and symbol information
	*
	* This endpoint will return all of the current Symbols on Binance
	* This includes each trading pair and their associated rules, eg. Precision, Status, etc.
	* */

	public static async GetExchangeInfo(): Promise<GetExchangeInfoDto> {
		const url: string = BinanceEndpoints.GetExchangeInfo();

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

}
