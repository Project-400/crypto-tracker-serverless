import BinanceEndpoints, { BinanceEndpoint } from './binance.endpoints';
import { HttpApi } from '../http-api';
import { BINANCE_API_KEY } from '../../../../../environment/env';
import { GetAllCoinsDto, GetAllSymbolPricesDto, GetDustLogsDto, GetSymbolPriceDto } from './binance.interfaces';
import { Trade } from '@crypto-tracker/common-types';
import { GetExchangeInfoDto } from './binance.interfaces/get-exchange-info.interfaces';
import { TransactionRequest } from '../../types';
import { BuyCurrencyFullDto } from './binance.interfaces/buy-currency.interfaces';

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

	/*
	* "Get information of coins (available for deposit and withdraw) for user"
	* https://binance-docs.github.io/apidocs/spot/en/#all-coins-39-information-user_data
	*
	* This endpoint will return a list of all the coins / currencies / tokens the user has invested in.
	* It include the amount of a particular token, the name, the network list (tokens that it can be exchanged with)
	* */

	public static async GetAllCoins(): Promise<GetAllCoinsDto> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_ALL_COINS, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Get trades for a specific account and symbol"
	* https://binance-docs.github.io/apidocs/spot/en/#account-trade-list-user_data
	*
	* This endpoint will return a list of trades the user has made through a specific Symbol.
	* A maximum of 1000 trades can be returned in a single call. Pagination will be required for large volumes.
	* */

	public static async GetSymbolTrades(symbol: string): Promise<Trade[]> {
		const data: any = BinanceApi.BinanceData({ symbol });
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_SYMBOL_TRADES, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Latest price for a symbol or symbols"
	* https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker
	*
	* This endpoint will return the current price for a given symbol, eg. LTCBTC
	* */

	public static async GetSymbolPrice(symbol: string): Promise<GetSymbolPriceDto> {
		const url: string = BinanceEndpoints.GetSymbolPrice(symbol);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Latest price for a symbol or symbols"
	* https://binance-docs.github.io/apidocs/spot/en/#symbol-price-ticker
	*
	* This endpoint will return the current price for a given symbol, eg. LTCBTC
	* */

	public static async GetAllSymbolPrices(): Promise<GetAllSymbolPricesDto> {
		const url: string = BinanceEndpoints.GetAllSymbolPrices();

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Fetch small amounts of assets exchanged BNB records"
	* https://binance-docs.github.io/apidocs/spot/en/#dustlog-user_data
	*
	* Binance gives the user the option to exchange any of their currencies worth less than 0.001 BTC (approx exchange rate) for BNB.
	* Doing this will remove all of the selected low value currencies and the user receives BNB (multiple exchanges per action).
	* This generates a log of these minor transactions, called Dust Logs.
	* This endpoint will return all of the logs from which the user had exchange their low value coins for BNB tokens.
	* */

	public static async GetDustLogs(): Promise<GetDustLogsDto> {
		const data: any = BinanceApi.BinanceData();
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.GET_DUST_LOGS, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Current exchange trading rules and symbol information"
	* https://binance-docs.github.io/apidocs/spot/en/#exchange-information
	*
	* This endpoint will return all of the current Symbols on Binance.
	* This includes each trading pair and their associated rules, eg. Precision, Status, etc.
	* */

	public static async GetExchangeInfo(): Promise<GetExchangeInfoDto> {
		const url: string = BinanceEndpoints.GetExchangeInfo();

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

	/*
	* "Send in a new order"
	* https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
	*
	* This endpoint wis used to place an order (buy currency / token).
	* */

	public static async BuyCurrency(buyData: TransactionRequest): Promise<BuyCurrencyFullDto> {
		const data: any = BinanceApi.BinanceData(buyData);
		const url: string = BinanceEndpoints.SignatureEndpoint(BinanceEndpoint.BUY_CURRENCY, data);

		return JSON.parse(await HttpApi.get(url, BinanceApi.headers));
	}

}
