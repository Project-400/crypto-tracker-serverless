import * as qs from 'qs';
import * as crypto from 'crypto';
import { BINANCE_API_DOMAIN, BINANCE_API_SECRET_KEY } from '../../../../../environment/env';

export default class BinanceEndpoints {

	private static StringifyData = (data: any): string => qs.stringify(data);

	private static FormSignature = (data: any): string => crypto
			.createHmac('sha256', BINANCE_API_SECRET_KEY)
			.update(data)
			.digest('hex')

	public FormEndpoint = (endpoint: BinanceEndpoint, data: any): string => {
		const stringifiedData: string = data && BinanceEndpoints.StringifyData(data);
		const signature: string = stringifiedData && BinanceEndpoints.FormSignature(stringifiedData);

		switch (endpoint) {
			case BinanceEndpoint.SYSTEM_STATUS:
				return BinanceEndpoints.GetSystemStatus();
			case BinanceEndpoint.GET_ALL_COINS:
				return BinanceEndpoints.GetAllCoins(stringifiedData, signature);
			default:
				return BinanceEndpoints.GetSystemStatus();
		}
	}

	public static GetAllCoins = (data: string, signature: string): string => `${BINANCE_API_DOMAIN}/sapi/v1/capital/config/getall?${data}&signature=${signature}`;

	public static GetSystemStatus = (): string => `${BINANCE_API_DOMAIN}/wapi/v3/systemStatus.html`;

}

export enum BinanceEndpoint {
	SYSTEM_STATUS,
	GET_ALL_COINS
}
