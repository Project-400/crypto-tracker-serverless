import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext, Coin, UnitOfWork, ErrorCode,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import * as qs from 'qs';
import _ from 'underscore';

export class CoinsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const coins: Coin[] = await this.unitOfWork.Coins.getAll();

		const coinsWithValue: Coin[] = coins.filter((c: Coin) => c.free > 0).sort((a: Coin, b: Coin) => {
			if (a.free < b.free) return 1;
			if (a.free > b.free) return -1;
			return 0;
		});

		try {
			return ResponseBuilder.ok({ coins: coinsWithValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public gatherUserCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let dataString: string = '';

		const coinsString: string = await new Promise((resolve: any, reject: any): void => {
			const data: string = qs.stringify({
				timestamp: new Date().getTime(),
				recvWindow: 10000
			});

			const signature: string
				= crypto
				.createHmac('sha256', 'PXxkSDbB86BKWlNOQYaQ1uujRQHBFoXiDjEUes2mNXAbsI07teWmVei8JPchIIoD')
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get(`https://api.binance.com/sapi/v1/capital/config/getall?${data}&signature=${signature}`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		const coins: Coin[] = JSON.parse(coinsString);

		await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.saveSingle(coin)));

		try {
			return ResponseBuilder.ok({ coinsGathered: coins.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getInvestmentChange: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		// if (!event.pathParameters || !event.pathParameters.coin)
		// 	return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		// const trades1: any = await this.getSymbolTrades('SRMUSDT');
		// console.log(trades1.length);
		// const trades2: any = await this.getSymbolTrades('SRMBNB');
		// console.log(trades2.length);
		// const trades3: any = await this.getSymbolTrades('SRMBTC');
		// console.log(trades3.length);
		// const trades4: any = await this.getSymbolTrades('SRMBUSD');
		// console.log(trades4.length);
		// const trades5: any = await this.getSymbolTrades('SRMBIDR');
		// console.log(trades5.length);

		const trades1: any = await this.getSymbolTrades('DOCKUSDT');
		console.log(trades1.length);
		const trades2: any = await this.getSymbolTrades('DOCKBTC');
		console.log(trades2.length);
		// const trades3: any = await this.getSymbolTrades('SRMBTC');
		// console.log(trades3.length);
		// const trades4: any = await this.getSymbolTrades('SRMBUSD');
		// console.log(trades4.length);
		// const trades5: any = await this.getSymbolTrades('SRMBIDR');
		// console.log(trades5.length);

		// const trades1: any = await this.getSymbolTrades('YFIUSDT');
		// console.log(trades1.length);
		// const trades2: any = await this.getSymbolTrades('YFIBNB');
		// console.log(trades2.length);
		// const trades3: any = await this.getSymbolTrades('YFIBUSD');
		// console.log(trades3.length);
		// const trades4: any = await this.getSymbolTrades('YFIBTC');
		// console.log(trades4.length);

		// const trades1: any = await this.getSymbolTrades('WINUSDT');
		// console.log(trades1.length);
		// const trades2: any = await this.getSymbolTrades('WINBNB');
		// console.log(trades2.length);
		// const trades3: any = await this.getSymbolTrades('WINTRX');
		// console.log(trades3.length);
		// const trades4: any = await this.getSymbolTrades('WINUSDC');
		// console.log(trades4.length);

		const sortedTrades: any = _.sortBy([ ...trades1, ...trades2 ], 'time');

		console.log(sortedTrades);

		const totals: { value: number; costs: any } = sortedTrades.reduce((ts: { value: number; costs: any }, trade: any) => {
			if (trade.isBuyer) {
				console.log(`+${trade.qty}`);
				ts.value += Number(trade.qty);
			}
			if (!trade.isBuyer) {
				console.log(`-${trade.qty}`);
				ts.value -= Number(trade.qty);
			}

			if (trade.commissionAsset === 'DOCK') {
				ts.value -= Number(trade.commission);
			}

			return ts;
		}, { value: 0, costs: { } });

		const logs: any = await this.getDustLogs();

		logs.map((log: any) => {

			if (log.fromAsset === 'DOCK') {
				console.log(log);
				totals.value -= log.amount;
			}
		});

		// const exchangeInfo: ExchangeInfoSymbol[] = await new ExchangeInfoController(this.unitOfWork).requestExchangeInfo();

		// const sushi: ExchangeInfoSymbol = exchangeInfo.find((s: ExchangeInfoSymbol) => s.symbol === 'SUSHIUSDT');

		const oldCost: number = sortedTrades[0].quoteQty;
		const newCost: number = await this.getSymbolPrice('WINBNB') * sortedTrades[0].qty;
		const diff: number = ((newCost - oldCost) / oldCost) * 100;

		// const coins: Coin[] = JSON.parse(coinsString);
		//
		// await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.saveSingle(coin)));

		try {
			return ResponseBuilder.ok({ trades: sortedTrades.length, oldCost, newCost, diff, totals });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private getSymbolTrades = async (symbol: string): Promise<any> => {
		let dataString: string = '';

		const ordersString: string = await new Promise((resolve: any, reject: any): void => {
			const data: string = qs.stringify({
				timestamp: new Date().getTime(),
				recvWindow: 10000,
				symbol
			});

			const signature: string
				= crypto
				.createHmac('sha256', 'PXxkSDbB86BKWlNOQYaQ1uujRQHBFoXiDjEUes2mNXAbsI07teWmVei8JPchIIoD')
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/myTrades?${data}&signature=${signature}`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		const trades: any = JSON.parse(ordersString);

		return trades;
	}

	private getSymbolPrice = async (symbol: string): Promise<number> => {
		let dataString: string = '';

		const priceString: string = await new Promise((resolve: any, reject: any): void => {
			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/ticker/price?symbol=WINBNB`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		console.log(priceString);

		const data: any = JSON.parse(priceString);

		return data.price;
	}

	private getDustLogs = async (): Promise<any> => {
		let dataString: string = '';

		const priceString: string = await new Promise((resolve: any, reject: any): void => {
			const data: string = qs.stringify({
				timestamp: new Date().getTime(),
				recvWindow: 10000
			});

			const signature: string
				= crypto
				.createHmac('sha256', 'PXxkSDbB86BKWlNOQYaQ1uujRQHBFoXiDjEUes2mNXAbsI07teWmVei8JPchIIoD')
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get(`https://api.binance.com/wapi/v3/userAssetDribbletLog.html?${data}&signature=${signature}`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		// const logs = JSON.parse(priceString).results.rows.map((r) => r)

		// console.log(JSON.parse(priceString).results.rows);

		const logs: any = [
			...JSON.parse(priceString).results.rows[0].logs,
			...JSON.parse(priceString).results.rows[1].logs,
			...JSON.parse(priceString).results.rows[2].logs
		];

		return logs;
	}

}
