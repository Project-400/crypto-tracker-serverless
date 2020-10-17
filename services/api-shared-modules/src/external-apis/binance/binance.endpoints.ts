import * as qs from 'qs';
import * as crypto from 'crypto';
import { BINANCE_API_DOMAIN, BINANCE_API_SECRET_KEY } from '../../../../../environment/env';

export default class BinanceEndpoints {

	public static SignatureEndpoint = (endpoint: BinanceEndpoint, data?: any): string => {
		const stringifiedData: string = data && BinanceEndpoints.StringifyData(data);
		const signature: string = stringifiedData && BinanceEndpoints.FormSignature(stringifiedData);

		switch (endpoint) {
			case BinanceEndpoint.SYSTEM_STATUS:
				return BinanceEndpoints.GetSystemStatus();
			case BinanceEndpoint.GET_ALL_COINS:
				return BinanceEndpoints.GetAllCoins(stringifiedData, signature);
			case BinanceEndpoint.GET_SYMBOL_TRADES:
				return BinanceEndpoints.GetSymbolTrades(stringifiedData, signature);
			default:
				return BinanceEndpoints.GetSystemStatus();
		}
	}

	private static StringifyData = (data: any): string => qs.stringify(data);

	private static FormSignature = (data: any): string => crypto
			.createHmac('sha256', BINANCE_API_SECRET_KEY)
			.update(data)
			.digest('hex')

	private static GetAllCoins = (data: string, signature: string): string => `${BINANCE_API_DOMAIN}/sapi/v1/capital/config/getall?${data}&signature=${signature}`;

	private static GetSymbolTrades = (data: string, signature: string): string => `${BINANCE_API_DOMAIN}/api/v3/myTrades?${data}&signature=${signature}`;

	public static GetSymbolPrice = (symbol: string): string => `${BINANCE_API_DOMAIN}/api/v3/ticker/price?symbol=${symbol}`;

	private static GetSystemStatus = (): string => `${BINANCE_API_DOMAIN}/wapi/v3/systemStatus.html`;

}

export enum BinanceEndpoint {
	SYSTEM_STATUS,
	GET_ALL_COINS,
	GET_SYMBOL_TRADES,
	GET_SYMBOL_PRICE
}
