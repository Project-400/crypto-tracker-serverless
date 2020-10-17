import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ErrorCode,
	ExchangePair,
	ResponseBuilder,
	UnitOfWork,
} from '../../api-shared-modules/src';
import _ from 'underscore';
import { ExchangePairsController } from '../../api-exchange-pairs/src/exchange-pairs.controller';
import { Trade } from '@crypto-tracker/common-types';
import { Coin, DustLog, DustLogRow, GetDustLogsDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

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
		try {
			const coins: Coin[] = await BinanceApi.GetAllCoins();

			// await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.saveSingle(coin)));

			return ResponseBuilder.ok({ coinsGathered: coins.length, coins });
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

		let trades: Trade[] = [];

		await Promise.all(
			coinPairs.map(async (pair: Partial<ExchangePair>) => {
				const t: Trade[] = await this.getSymbolTrades(pair.symbol);
				console.log(`${pair.symbol}: ${t.length}`);
				trades = [ ...trades, ...t ];
			})
		);

		const sortedTrades: Trade[] = _.sortBy(trades, 'time');

		console.log(sortedTrades);

		let totalQty: number = 0;
		let totalInvestedValue: number = 0;
		let totalInvestedValueMinusCommission: number = 0;
		let currentValue: number = 0;
		let currentProfitLoss: number = 0;
		let takenProfitLoss: number = 0;
		let btcPrice: number = 0;

		const usdtbtcPrice: number = await this.getSymbolPrice('BTCUSDT');

		sortedTrades.map((trade: Trade) => {
			// const totals: { value: number; costs: any } = sortedTrades.reduce((ts: { value: number; costs: any }, trade: any) => {
			// 	if (!ts.costs[trade.symbol]) ts.costs[trade.symbol] = 0;

			const qty: number = Number(trade.qty);
			const price: number = Number(trade.price);
			// const curUsdtbtcPrice: number = trade.id === 4232940 ? 11900 : 11000;
			btcPrice = trade.symbol.endsWith('BTC') ? price : price / usdtbtcPrice;
			console.log(btcPrice);
			const thisTradeInvestedValue: number = qty * btcPrice; // White
			const currentTotalValue: number = totalQty * btcPrice; // Blue

			if (trade.isBuyer) {
				totalInvestedValue += thisTradeInvestedValue; // Purple
				totalInvestedValueMinusCommission += thisTradeInvestedValue; // Purple
				totalQty += qty; // Pink
				currentValue = currentTotalValue + thisTradeInvestedValue; // Green

				// ts.value += Number(trade.qty);
				// ts.costs[trade.symbol] += Number(trade.qty) * Number(trade.price);
			}
			if (!trade.isBuyer) {
				totalInvestedValue -= thisTradeInvestedValue; // Purple
				totalInvestedValueMinusCommission -= thisTradeInvestedValue; // Purple
				totalQty -= qty; // Pink
				currentValue = currentTotalValue - thisTradeInvestedValue; // Green

				// ts.value -= Number(trade.qty);
				// ts.costs[trade.symbol] -= Number(trade.qty) * Number(trade.price);
			}

			if (trade.commissionAsset === coin) {
				totalInvestedValueMinusCommission -= (Number(trade.commission) * btcPrice); // Purple
				totalQty -= Number(trade.commission); // Pink
				currentValue = currentTotalValue - (Number(trade.commission) * btcPrice);
				// ts.value -= Number(trade.commission);
			}

			const thisTradeProfitLoss: number = currentValue - totalInvestedValue; // Yellow

			if (!trade.isBuyer) {
				const percentageSold: number = (100 / currentTotalValue) * thisTradeInvestedValue;
				const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
				takenProfitLoss += profitLossSold;
				currentProfitLoss = thisTradeProfitLoss - profitLossSold;
			}
		});

			// return ts;
		// }, { value: 0, costs: { } });

		const logs: any = await this.getDustLogs();

		logs.map((log: any) => {
			if (log.fromAsset === coin) {
				console.log(log);
				totalQty -= log.amount; // Pink
				totalInvestedValue -= (log.amount * btcPrice); // Purple
				totalInvestedValueMinusCommission -= (log.amount * btcPrice); // Purple
				// totals.value -= log.amount;
			}
		});

		// totals.roundedValue7 = totals.value.toFixed(7);
		// totals.roundedValue8 = totals.value.toFixed(8);
		// const exchangeInfo: ExchangeInfoSymbol[] = await new ExchangeInfoController(this.unitOfWork).requestExchangeInfo();
		// const sushi: ExchangeInfoSymbol = exchangeInfo.find((s: ExchangeInfoSymbol) => s.symbol === 'SUSHIUSDT');

		const currentPrice: number = await this.getSymbolPrice(`${coin}USDT`);
		const currentBtcPrice: number = Number((currentPrice / usdtbtcPrice));
		const currentBtcPriceRounded: number = Number((currentPrice / usdtbtcPrice).toFixed(8));
		currentValue = currentBtcPrice * totalQty;
		const currentValueRounded: number = Number((currentBtcPriceRounded * totalQty).toFixed(8));
		currentProfitLoss = currentValue - totalInvestedValueMinusCommission;
		const diff: number = Number((((currentValue - totalInvestedValueMinusCommission) / totalInvestedValueMinusCommission) * 100).toFixed(2));

		const details = {
			BTC: {
				totalQty: Number(totalQty.toFixed(9)),
				currentPrice: currentBtcPriceRounded,
				totalInvestedValue,
				totalInvestedValueMinusCommission,
				currentValue: currentValueRounded,
				currentProfitLoss,
				takenProfitLoss,
				diff
			},
			USDT: {
				totalQty: Number(totalQty.toFixed(9)),
				currentPrice: Number(this.BTCtoUSDT(usdtbtcPrice, currentBtcPrice).toFixed(7)),
				totalInvestedValue: this.BTCtoUSDTRounded(usdtbtcPrice, totalInvestedValue),
				totalInvestedValueMinusCommission: this.BTCtoUSDTRounded(usdtbtcPrice, totalInvestedValueMinusCommission),
				currentValue: this.BTCtoUSDTRounded(usdtbtcPrice, currentValue),
				currentProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, currentProfitLoss),
				takenProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, takenProfitLoss),
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
			return ResponseBuilder.ok({ trades: sortedTrades.length, diff, details });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private BTCtoUSDT = (btcPrice: number, btcValue: number): number => (btcValue * btcPrice);

	private BTCtoUSDTRounded = (btcPrice: number, btcValue: number): number => Number(this.BTCtoUSDT(btcPrice, btcValue).toFixed(2));

	private getSymbolTrades = async (symbol: string): Promise<Trade[]> => {
		const trades: Trade[] = await BinanceApi.GetSymbolTrades(symbol);

		return trades;
	}

	private getSymbolPrice = async (symbol: string): Promise<number> => BinanceApi.GetSymbolPrice(symbol);

	private getDustLogs = async (): Promise<DustLog[]> => {
		const dustLogsDetails: GetDustLogsDto = await BinanceApi.GetDustLogs();

		if (!dustLogsDetails.results.total) return [];

		return dustLogsDetails.results.rows.reduce((allLogs: DustLog[], logRow: DustLogRow) => {
			allLogs.push(...logRow.logs);
			return allLogs;
		}, []);
	}

}
