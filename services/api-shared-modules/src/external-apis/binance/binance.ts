import BinanceEndpoints, { BinanceEndpoint } from './binance-endpoints';
import { HttpApi } from '../http-api';
import { BINANCE_API_KEY } from '../../../../../environment/env';

export default class BinanceApi {

	private static headers: { [key: string]: string } = {
		'X-MBX-APIKEY': BINANCE_API_KEY
	};

	private static BinanceData = (): any =>
		({
			timestamp: new Date().getTime(),
			recvWindow: 2000
		})

	public static async GetAllCoins(): Promise<string> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.FormEndpoint(BinanceEndpoint.GET_ALL_COINS, data);

		return HttpApi.get(url, BinanceApi.headers);
	}

}
