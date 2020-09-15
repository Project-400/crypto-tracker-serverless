import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext, Coin, UnitOfWork, ErrorCode, ExchangePair,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import * as qs from 'qs';
import _ from 'underscore';
import { ExchangePairsController } from '../../api-exchange-pairs/src/exchange-pairs.controller';

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
		if (!event.pathParameters || !event.pathParameters.coin)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const coin: string = event.pathParameters.coin.toUpperCase();

		const exchangePairs: ExchangePairsController = new ExchangePairsController(this.unitOfWork);
		const pairs: Array<Partial<ExchangePair>> = await exchangePairs.requestExchangePairs();
		const coinPairs: Array<Partial<ExchangePair>> = pairs.filter((p: ExchangePair) => p.base === coin);

		let trades: any[] = [];

		await Promise.all(
			coinPairs.map(async (pair: Partial<ExchangePair>) => {
				const t: any = await this.getSymbolTrades(pair.symbol);
				trades = [ ...trades, ...t ];
			})
		);

		const sortedTrades: any = _.sortBy(trades, 'time');

		let totalQty: number = 0;
		let totalInvestedValue: number = 0;
		let currentValue: number = 0;
		let currentProfitLoss: number = 0;
		let takenProfitLoss: number = 0;
		let btcPrice: number = 0;

		const usdtbtcPrice: number = await this.getSymbolPrice('BTCUSDT');

		console.log('PRICE');
		console.log(usdtbtcPrice);

		const totals: { value: number; costs: any } = sortedTrades.reduce((ts: { value: number; costs: any }, trade: any) => {
			if (!ts.costs[trade.symbol]) ts.costs[trade.symbol] = 0;

			const qty: number = Number(trade.qty);
			const price: number = Number(trade.price);
			btcPrice = trade.symbol.endsWith('BTC') ? price : price / usdtbtcPrice;
			const thisTradeInvestedValue: number = qty * btcPrice; // White
			const currentTotalValue: number = totalQty * btcPrice; // Blue

			if (trade.isBuyer) {
				totalInvestedValue += thisTradeInvestedValue; // Purple
				totalQty += qty; // Pink
				currentValue = currentTotalValue + thisTradeInvestedValue; // Green

				// ts.value += Number(trade.qty);
				// ts.costs[trade.symbol] += Number(trade.qty) * Number(trade.price);
			}
			if (!trade.isBuyer) {
				totalInvestedValue -= thisTradeInvestedValue; // Purple
				totalQty -= qty; // Pink
				currentValue = currentTotalValue - thisTradeInvestedValue; // Green

				// ts.value -= Number(trade.qty);
				// ts.costs[trade.symbol] -= Number(trade.qty) * Number(trade.price);
			}

			if (trade.commissionAsset === 'PERL') {
				// totalInvestedValue -= thisTradeInvestedValue; // Purple
				totalQty -= Number(trade.commission); // Pink

				// ts.value -= Number(trade.commission);
			}

			const thisTradeProfitLoss: number = currentValue - totalInvestedValue; // Yellow

			if (!trade.isBuyer) {
				const percentageSold: number = (100 / currentTotalValue) * thisTradeInvestedValue;
				const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
				takenProfitLoss += profitLossSold;
				currentProfitLoss = thisTradeProfitLoss - profitLossSold;
			}

			return ts;
		}, { value: 0, costs: { } });

		const logs: any = await this.getDustLogs();

		logs.map((log: any) => {
			if (log.fromAsset === 'PERL') {
				console.log(log);
				totalQty -= log.amount; // Pink
				// totalInvestedValue -= (log.amount * btcPrice); // Purple
				// totals.value -= log.amount;
			}
		});

		// totals.roundedValue7 = totals.value.toFixed(7);
		// totals.roundedValue8 = totals.value.toFixed(8);
		// const exchangeInfo: ExchangeInfoSymbol[] = await new ExchangeInfoController(this.unitOfWork).requestExchangeInfo();
		// const sushi: ExchangeInfoSymbol = exchangeInfo.find((s: ExchangeInfoSymbol) => s.symbol === 'SUSHIUSDT');

		const currentPrice: number = await this.getSymbolPrice('PERLUSDT');
		const currentBtcPrice: number = currentPrice / usdtbtcPrice;
		const newCost: number = currentBtcPrice * totalQty;
		const diff: number = ((newCost - totalInvestedValue) / totalInvestedValue) * 100;

		currentValue = newCost;
		currentProfitLoss = newCost - totalInvestedValue;

		const details = {
			BTC: {
				totalQty,
				currentPrice: currentBtcPrice,
				totalInvestedValue,
				currentValue,
				currentProfitLoss,
				takenProfitLoss,
				newCost,
				diff
			},
			USDT: {
				totalQty,
				currentPrice: this.BTCtoUSDTRounded(usdtbtcPrice, currentBtcPrice),
				totalInvestedValue: this.BTCtoUSDTRounded(usdtbtcPrice, totalInvestedValue),
				currentValue: this.BTCtoUSDTRounded(usdtbtcPrice, currentValue),
				currentProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, currentProfitLoss),
				takenProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, takenProfitLoss),
				newCost: this.BTCtoUSDTRounded(usdtbtcPrice, newCost),
				diff
			}
		};

		// totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
		// currentValue: Number(currentValue.toFixed(2)),
		// currentProfitLoss: Number(currentProfitLoss.toFixed(2)),
		// takenProfitLoss: Number(takenProfitLoss.toFixed(2)),
		// newCost: Number(newCost.toFixed(2)),
		// diff: Number(diff.toFixed(2))

		// const coins: Coin[] = JSON.parse(coinsString);
		//
		// await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.saveSingle(coin)));

		try {
			return ResponseBuilder.ok({ trades: sortedTrades.length, newCost, diff, totals, details });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private BTCtoUSDTRounded = (btcPrice: number, btcValue: number): number => Number((btcValue * btcPrice).toFixed(2));

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
			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
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

		const data: any = JSON.parse(priceString);

		if (!data.price) return 0;

		return Number(data.price);
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
			...JSON.parse(priceString).results.rows[2].logs,
			...JSON.parse(priceString).results.rows[3].logs
		];

		return logs;
	}

	// private getAllCoins = async (): Promise<void> => {
	// 	let dataString: string = '';
	//
	// 	const priceString: string = await new Promise((resolve: any, reject: any): void => {
	// 		const data: string = qs.stringify({
	// 			timestamp: new Date().getTime(),
	// 			recvWindow: 10000
	// 		});
	//
	// 		const signature: string
	// 			= crypto
	// 			.createHmac('sha256', 'PXxkSDbB86BKWlNOQYaQ1uujRQHBFoXiDjEUes2mNXAbsI07teWmVei8JPchIIoD')
	// 			.update(data)
	// 			.digest('hex');
	//
	// 		const req: ClientRequest = https.get(`https://api.binance.com/sapi/v1/capital/config/getall?${data}&signature=${signature}`, {
	// 			headers: {
	// 				'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
	// 			}
	// 		}, (res: IncomingMessage) => {
	// 			res.on('data', (chunk: any) => dataString += chunk);
	// 			res.on('end', () => {
	// 				resolve(dataString);
	// 			});
	// 		});
	//
	// 		req.on('error', reject);
	// 	});
	//
	// 	const d: any = JSON.parse(priceString);
	//
	// 	// return Number(data.price);
	// 	return d;
	// }

}
