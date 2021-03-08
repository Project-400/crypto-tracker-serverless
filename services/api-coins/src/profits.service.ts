import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import {
	DustLog,
	DustLogRow, GetAllSymbolPricesDto,
	GetDustLogsDto,
	GetSymbolPriceDto
} from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { ExchangePair } from '../../api-shared-modules/src/types';
import { KlineValues, Trade } from '@crypto-tracker/common-types';
import _ from 'underscore';
import { ExchangePairsService } from '../../api-exchange-pairs/src/exchange-pairs.service';
import { PairPriceList } from '../../api-valuation/src/valuation.service';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';

interface DustLogTotals {
	totalQty: number;
	totalInvestedValue: number;
	totalInvestedValueMinusCommission: number;
}

export class ProfitsService {

	public constructor(
		private unitOfWork: UnitOfWork,
		private exchangeInfoService: ExchangeInfoService
	) { }

	/*
	*
	* A dust log involves completely wiping out one or more currencies in exchange for BNB.
	* If a currency exists in a set of dust logs, there are none of that currency left in
	* the user's wallet from that point until they buy that currency again.
	* It is safe to assume that the value and profits of that currency are zero from the date
	* they last exchanged that currency for BNB (via Dust logging) and that all trades prior
	* to that date do not need to be taken into account during the calculations.
	*
	* */

	public getInvestmentChange = async (coin: string): Promise<any> => {
		const prices: PairPriceList = await this.getSymbolPrices();
		const BTCUSDT_Price: number = Number(prices.BTCUSDT);
		const ETHUSDT_Price: number = Number(prices.ETHUSDT);
		const BNBBUSD_Price: number = Number(prices.BNBUSDT);
		const coinUsdtPrice: number = Number(prices[`${coin}USDT`]);
		const coinBusdPrice: number = Number(prices[`${coin}BUSD`]);
		const coinBtcPrice: number = Number(prices[`${coin}BTC`]);
		const coinEthPrice: number = Number(prices[`${coin}ETH`]);
		const coinBnbPrice: number = Number(prices[`${coin}BNB`]);
		const coinUsdPrice: number = this.getUsdValue(coin, coinUsdtPrice, coinBusdPrice,
			coinBtcPrice, coinEthPrice, coinBnbPrice, BTCUSDT_Price, ETHUSDT_Price, BNBBUSD_Price);
		const currentCoinBtcPrice: number = coinBtcPrice || (coinUsdPrice / BTCUSDT_Price);

		console.log('coinUsdPrice');
		console.log(coinUsdPrice);

		const exchangePairs: ExchangePairsService = new ExchangePairsService(this.unitOfWork);
		const pairs: Array<Partial<ExchangePair>> = await exchangePairs.requestExchangePairs();
		const coinPairs: Array<Partial<ExchangePair>> = pairs.filter((p: ExchangePair) => p.base === coin);
		const allDustLogs: DustLog[] = await this.getDustLogs();
		const coinDustLogTotals: DustLogTotals = await this.getCoinDustLogTotals(allDustLogs, coin, currentCoinBtcPrice);
		const coinDustlogs: DustLog[] = allDustLogs.filter((l: DustLog) => l.fromAsset === coin);
		const lastDustLogDate: number = this.getLastDustLogDate(allDustLogs, coin);
		const trades: Trade[] = await this.getSymbolTrades(coinPairs);
		// const trades: Trade[] = await this.getSymbolTrades(coinPairs, lastDustLogDate);

		let totalQty: number = 0 - coinDustLogTotals.totalQty;
		console.log('totalQty');
		console.log(totalQty);
		// let totalInvestedValue: number = 0 - coinDustLogTotals.totalInvestedValue;
		let totalInvestedDollars: number = 0;
		// let totalInvestedValueMinusCommission: number = 0 - coinDustLogTotals.totalInvestedValueMinusCommission;
		let totalInvestedDollarsCommission: number = 0;
		// let currentValue: number = 0;
		let currentDollarsValue: number = 0;
		let currentProfitLoss: number = 0;
		let takenProfitLoss: number = 0;
		// let usdPrice: number = 0;

		for (const trade of trades) {
			const qty: number = Number(trade.qty);
			const price: number = Number(trade.price);
			const time: number = Number(trade.time);

			const { thisTradeInvestedDollars, usdPrice }: { thisTradeInvestedDollars: number; usdPrice: number } =
				await this.getPreviousInvestedValue(trade);

			// console.log('PRICE');
			// console.log(price);
			// console.log(prevBtcUsdtPrice);
			// console.log(usdPrice);
			// console.log(thisTradeInvestedDollars);

			if (trade.isBuyer) {
				totalInvestedDollars += thisTradeInvestedDollars;

				// totalInvestedValue += thisTradeInvestedValue;
				// totalInvestedValueMinusCommission += thisTradeInvestedValue;
				totalQty += qty;
			}
			if (!trade.isBuyer) {
				totalInvestedDollars -= thisTradeInvestedDollars;

				// totalInvestedValue -= thisTradeInvestedValue;
				// totalInvestedValueMinusCommission -= thisTradeInvestedValue;
				totalQty -= qty;
			}

			if (trade.commissionAsset === coin) {
				totalInvestedDollarsCommission += (Number(trade.commission) * usdPrice);

				// totalInvestedValueMinusCommission -= (Number(trade.commission) * btcPrice);
				totalQty -= Number(trade.commission);
			}

			const thisTradeProfitLoss: number = currentDollarsValue - totalInvestedDollars;
			// const thisTradeProfitLoss: number = currentValue - totalInvestedValue;

			if (!trade.isBuyer) {
				const percentageSold: number = (100 / totalInvestedDollars) * thisTradeInvestedDollars;
				const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
				takenProfitLoss += profitLossSold;
				currentProfitLoss = thisTradeProfitLoss - profitLossSold;
			}
		}
		// }));

		// currentValue = currentCoinBtcPrice * totalQty;
		currentDollarsValue = coinUsdPrice * totalQty;
		console.log(totalQty);
		console.log(currentDollarsValue);
		currentProfitLoss = currentDollarsValue - totalInvestedDollars;
		// currentProfitLoss = currentValue - totalInvestedValueMinusCommission;
		// const diff: number = Number((((currentValue - totalInvestedValueMinusCommission) /
		// totalInvestedValueMinusCommission) * 100).toFixed(2));

		const details: any = {
			totalQty: Number(totalQty.toFixed(9)),
			currentPrice: coinUsdPrice,
			// currentPrice: Number(this.BTCtoUSDT(BTCUSDT_Price, currentCoinBtcPrice).toFixed(7)),
			// totalInvestedValue: this.BTCtoUSDTRounded(BTCUSDT_Price, totalInvestedValue),
			totalInvestedDollars,
			totalInvestedDollarsCommission,
			currentDollarsValue,
			// totalInvestedValueMinusCommission: this.BTCtoUSDTRounded(BTCUSDT_Price, totalInvestedValueMinusCommission),
			// currentValue: this.BTCtoUSDTRounded(BTCUSDT_Price, currentValue),
			// currentProfitLoss: this.BTCtoUSDTRounded(BTCUSDT_Price, currentProfitLoss),
			currentProfitLoss,
			takenProfitLoss
			// takenProfitLoss: this.BTCtoUSDTRounded(BTCUSDT_Price, takenProfitLoss)
			// diff
		};

		return {
			counts: {
				dustLogs: coinDustlogs.length,
				trades: trades.length
			},
			symbols: trades.map((t: Trade) => t.symbol),
			details,
			trades,
			lastDustLogDate,
			dustLogs: coinDustlogs,
			allDustLogs
		};
	}

	private getPreviousInvestedValue = async (trade: Trade): Promise<{ thisTradeInvestedDollars: number; usdPrice: number }> => {
		const qty: number = Number(trade.qty);
		const price: number = Number(trade.price);
		const time: number = Number(trade.time);
		let quoteSymbol: string;

		if (trade.symbol.endsWith('BTC')) quoteSymbol = 'BTCUSDT';
		else if (trade.symbol.endsWith('BNB')) quoteSymbol = 'BNBBUSD';
		else if (trade.symbol.endsWith('ETH')) quoteSymbol = 'ETHUSDT';

		if (quoteSymbol) {
			const klineData: any = await BinanceApi.GetKlineData(quoteSymbol, '1m', time, time + 60000, 1);

			const klineEvent: any = klineData[0];
			const prevPrice: number = (Number(klineEvent[1]) + Number(klineEvent[4])) / 2; // Average between open and close
			const usdPrice: number = price * prevPrice;

			return { thisTradeInvestedDollars: qty * usdPrice, usdPrice };
		}

		return { thisTradeInvestedDollars: qty, usdPrice: 1 }; // Trade quote was USD-based stable coin
	}

	private getUsdValue = (coin: string, coinUsdtPrice: number, coinBusdPrice: number, coinBtcPrice: number,
						   coinEthPrice: number, coinBnbPrice: number, BTCUSDT_Price: number,
						   ETHUSDT_Price: number, BNBBUSD_Price: number): number => {
		const usdValue: number =
			(coinBtcPrice ? this.btcToUsd(BTCUSDT_Price, coinBtcPrice) : false) || // BTC conversion is more accurate
			coinBusdPrice ||
			coinUsdtPrice ||
			(coinEthPrice ? this.ethToUsd(ETHUSDT_Price, coinEthPrice) : false) ||
			(coinBnbPrice ? this.bnbToUsd(BNBBUSD_Price, coinBnbPrice) : false) ||
			0;

		if (coin === 'USDT' || coin === 'BUSD') return 1;

		return usdValue;
	}

	private getSymbolPrices = async (): Promise<PairPriceList> => {
		const symbolPricesDto: GetAllSymbolPricesDto = await BinanceApi.GetAllSymbolPrices();
		const nonTradingPairs: string[] = await this.exchangeInfoService.getNonTradingPairs();
		const prices: { [symbol: string]: string } = { };

		symbolPricesDto.filter((symbolPriceDto: GetSymbolPriceDto) =>
			nonTradingPairs.indexOf(symbolPriceDto.symbol) <= -1 // Remove non-trading pairs
		).map((symbolPriceDto: GetSymbolPriceDto) => {
			prices[symbolPriceDto.symbol] = symbolPriceDto.price;
		});

		return prices;
	}

	private btcToUsd = (btcValue: number, btcUsdtPrice: number): number => btcUsdtPrice * btcValue;

	private ethToUsd = (ethValue: number, ethUsdtPrice: number): number => ethUsdtPrice * ethValue;

	private bnbToUsd = (bnbValue: number, bnbUsdtPrice: number): number => bnbUsdtPrice * bnbValue;

	private BTCtoUSDT = (btcPrice: number, btcValue: number): number => (btcValue * btcPrice);

	private BTCtoUSDTRounded = (btcPrice: number, btcValue: number): number => Number(this.BTCtoUSDT(btcPrice, btcValue).toFixed(2));

	private getSymbolTrades = async (coinPairs: Array<Partial<ExchangePair>>, fromDate?: number): Promise<Trade[]> => {
		const trades: Trade[] = [];

		// TODO: Max 1000 trades returned - May need to incorporate paging

		await Promise.all(
			coinPairs.map(async (pair: Partial<ExchangePair>) => {
				const t: Trade[] = await BinanceApi.GetSymbolTrades(pair.symbol, fromDate);
				trades.push(...t);
			})
		);

		return _.sortBy(trades, 'time');
	}

	private getDustLogs = async (): Promise<DustLog[]> => {
		const dustLogsDetails: GetDustLogsDto = await BinanceApi.GetDustLogs();

		if (!dustLogsDetails.results.total) return [];

		const logs: DustLog[] = dustLogsDetails.results.rows.reduce((allLogs: DustLog[], logRow: DustLogRow) => {
			allLogs.push(...logRow.logs);
			return allLogs;
		}, []);

		return _.sortBy(logs, 'operateTime');
	}

	private getCoinDustLogTotals = (logs: DustLog[], coin: string, btcPrice: number): DustLogTotals => {
		// TODO: Incorporate serviceChargeAmount?
		let totalQty: number = 0;
		let totalInvestedValue: number = 0;
		let totalInvestedValueMinusCommission: number = 0;

		logs.filter((log: DustLog) => log.fromAsset === coin).map((log: DustLog) => {
			totalQty += log.amount;
			totalInvestedValue += (log.amount * btcPrice);
			totalInvestedValueMinusCommission += (log.amount * btcPrice);
		});

		return {
			totalQty,
			totalInvestedValue,
			totalInvestedValueMinusCommission
		};
	}

	private getLastDustLogDate = (logs: DustLog[], coin: string): number => {
		const log: DustLog = logs.find((dl: DustLog) => dl.fromAsset === coin);
		return log && log.operateTime && new Date(log.operateTime).getTime();
	}

	// public getInvestmentChange = async (coin: string): Promise<any> => {
	// 	const exchangePairs: ExchangePairsService = new ExchangePairsService(this.unitOfWork);
	// 	const pairs: Array<Partial<ExchangePair>> = await exchangePairs.requestExchangePairs();
	// 	const coinPairs: Array<Partial<ExchangePair>> = pairs.filter((p: ExchangePair) => p.base === coin);
	//
	// 	let trades: Trade[] = [];
	//
	// 	await Promise.all(
	// 		coinPairs.map(async (pair: Partial<ExchangePair>) => {
	// 			const t: Trade[] = await this.getSymbolTrades(pair.symbol);
	// 			console.log('T');
	// 			console.log(t);
	// 			console.log(`${pair.symbol}: ${t.length}`);
	// 			trades = [ ...trades, ...t ];
	// 		})
	// 	);
	//
	// 	const sortedTrades: Trade[] = _.sortBy(trades, 'time');
	//
	// 	console.log(sortedTrades);
	//
	// 	let totalQty: number = 0;
	// 	let totalInvestedValue: number = 0;
	// 	let totalInvestedValueMinusCommission: number = 0;
	// 	let currentValue: number = 0;
	// 	let currentProfitLoss: number = 0;
	// 	let takenProfitLoss: number = 0;
	// 	let btcPrice: number = 0;
	//
	// 	const usdtbtcPrice: number = await this.getSymbolPrice('BTCUSDT');
	//
	// 	sortedTrades.map((trade: Trade) => {
	// 		// const totals: { value: number; costs: any } = sortedTrades.reduce((ts: { value: number; costs: any }, trade: any) => {
	// 		// 	if (!ts.costs[trade.symbol]) ts.costs[trade.symbol] = 0;
	//
	// 		const qty: number = Number(trade.qty);
	// 		const price: number = Number(trade.price);
	// 		// const curUsdtbtcPrice: number = trade.id === 4232940 ? 11900 : 11000;
	// 		btcPrice = trade.symbol.endsWith('BTC') ? price : price / usdtbtcPrice;
	// 		console.log(btcPrice);
	// 		const thisTradeInvestedValue: number = qty * btcPrice; // White
	// 		const currentTotalValue: number = totalQty * btcPrice; // Blue
	//
	// 		if (trade.isBuyer) {
	// 			totalInvestedValue += thisTradeInvestedValue; // Purple
	// 			totalInvestedValueMinusCommission += thisTradeInvestedValue; // Purple
	// 			totalQty += qty; // Pink
	// 			currentValue = currentTotalValue + thisTradeInvestedValue; // Green
	//
	// 			// ts.value += Number(trade.qty);
	// 			// ts.costs[trade.symbol] += Number(trade.qty) * Number(trade.price);
	// 		}
	// 		if (!trade.isBuyer) {
	// 			totalInvestedValue -= thisTradeInvestedValue; // Purple
	// 			totalInvestedValueMinusCommission -= thisTradeInvestedValue; // Purple
	// 			totalQty -= qty; // Pink
	// 			currentValue = currentTotalValue - thisTradeInvestedValue; // Green
	//
	// 			// ts.value -= Number(trade.qty);
	// 			// ts.costs[trade.symbol] -= Number(trade.qty) * Number(trade.price);
	// 		}
	//
	// 		if (trade.commissionAsset === coin) {
	// 			totalInvestedValueMinusCommission -= (Number(trade.commission) * btcPrice); // Purple
	// 			totalQty -= Number(trade.commission); // Pink
	// 			currentValue = currentTotalValue - (Number(trade.commission) * btcPrice);
	// 			// ts.value -= Number(trade.commission);
	// 		}
	//
	// 		const thisTradeProfitLoss: number = currentValue - totalInvestedValue; // Yellow
	//
	// 		if (!trade.isBuyer) {
	// 			const percentageSold: number = (100 / currentTotalValue) * thisTradeInvestedValue;
	// 			const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
	// 			takenProfitLoss += profitLossSold;
	// 			currentProfitLoss = thisTradeProfitLoss - profitLossSold;
	// 		}
	// 	});
	//
	// 	// return ts;
	// 	// }, { value: 0, costs: { } });
	//
	// 	const logs: any = await this.getDustLogs();
	//
	// 	logs.map((log: any) => {
	// 		if (log.fromAsset === coin) {
	// 			console.log(log);
	// 			totalQty -= log.amount; // Pink
	// 			totalInvestedValue -= (log.amount * btcPrice); // Purple
	// 			totalInvestedValueMinusCommission -= (log.amount * btcPrice); // Purple
	// 			// totals.value -= log.amount;
	// 		}
	// 	});
	//
	// 	// totals.roundedValue7 = totals.value.toFixed(7);
	// 	// totals.roundedValue8 = totals.value.toFixed(8);
	// 	// const exchangeInfo: ExchangeInfoSymbol[] = await new ExchangeInfoController(this.unitOfWork).requestExchangeInfo();
	// 	// const sushi: ExchangeInfoSymbol = exchangeInfo.find((s: ExchangeInfoSymbol) => s.symbol === 'SUSHIUSDT');
	//
	// 	const currentPrice: number = await this.getSymbolPrice(`${coin}USDT`);
	// 	const currentBtcPrice: number = Number((currentPrice / usdtbtcPrice));
	// 	const currentBtcPriceRounded: number = Number((currentPrice / usdtbtcPrice).toFixed(8));
	// 	currentValue = currentBtcPrice * totalQty;
	// 	const currentValueRounded: number = Number((currentBtcPriceRounded * totalQty).toFixed(8));
	// 	currentProfitLoss = currentValue - totalInvestedValueMinusCommission;
	// 	const diff: number = Number((((currentValue - totalInvestedValueMinusCommission) /
	// 	totalInvestedValueMinusCommission) * 100).toFixed(2));
	//
	// 	const details: any = {
	// 		BTC: {
	// 			totalQty: Number(totalQty.toFixed(9)),
	// 			currentPrice: currentBtcPriceRounded,
	// 			totalInvestedValue,
	// 			totalInvestedValueMinusCommission,
	// 			currentValue: currentValueRounded,
	// 			currentProfitLoss,
	// 			takenProfitLoss,
	// 			diff
	// 		},
	// 		USDT: {
	// 			totalQty: Number(totalQty.toFixed(9)),
	// 			currentPrice: Number(this.BTCtoUSDT(usdtbtcPrice, currentBtcPrice).toFixed(7)),
	// 			totalInvestedValue: this.BTCtoUSDTRounded(usdtbtcPrice, totalInvestedValue),
	// 			totalInvestedValueMinusCommission: this.BTCtoUSDTRounded(usdtbtcPrice, totalInvestedValueMinusCommission),
	// 			currentValue: this.BTCtoUSDTRounded(usdtbtcPrice, currentValue),
	// 			currentProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, currentProfitLoss),
	// 			takenProfitLoss: this.BTCtoUSDTRounded(usdtbtcPrice, takenProfitLoss),
	// 			diff
	// 		}
	// 	};
	//
	// 	// totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
	// 	// currentValue: Number(currentValue.toFixed(2)),
	// 	// currentProfitLoss: Number(currentProfitLoss.toFixed(2)),
	// 	// takenProfitLoss: Number(takenProfitLoss.toFixed(2)),
	// 	// newCost: Number(newCost.toFixed(2)),
	// 	// diff: Number(diff.toFixed(2))
	//
	// 	// const coins: Coin[] = JSON.parse(coinsString);
	// 	//
	// 	// await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.saveSingle(coin)));
	//
	// 	return {
	// 		details,
	// 		diff,
	// 		sortedTrades
	// 	};
	// }

	// public getInvestmentChange = async (coin: string): Promise<any> => {
	// 	const prices: PairPriceList = await this.getSymbolPrices();
	// 	const BTCUSDT_Price: number = Number(prices.BTCUSDT);
	// 	const ETHUSDT_Price: number = Number(prices.ETHUSDT);
	// 	const BNBBUSD_Price: number = Number(prices.BNBUSDT);
	// 	const coinUsdtPrice: number = Number(prices[`${coin}USDT`]);
	// 	const coinBusdPrice: number = Number(prices[`${coin}BUSD`]);
	// 	const coinBtcPrice: number = Number(prices[`${coin}BTC`]);
	// 	const coinEthPrice: number = Number(prices[`${coin}ETH`]);
	// 	const coinBnbPrice: number = Number(prices[`${coin}BNB`]);
	// 	const coinUsdPrice: number = this.getUsdValue(coin, coinUsdtPrice, coinBusdPrice,
	// 		coinBtcPrice, coinEthPrice, coinBnbPrice, BTCUSDT_Price, ETHUSDT_Price, BNBBUSD_Price);
	// 	const currentCoinBtcPrice: number = coinBtcPrice || (coinUsdPrice / BTCUSDT_Price);
	//
	// 	const exchangePairs: ExchangePairsService = new ExchangePairsService(this.unitOfWork);
	// 	const pairs: Array<Partial<ExchangePair>> = await exchangePairs.requestExchangePairs();
	// 	const coinPairs: Array<Partial<ExchangePair>> = pairs.filter((p: ExchangePair) => p.base === coin);
	// 	const allDustLogs: DustLog[] = await this.getDustLogs();
	// 	const coinDustLogTotals: DustLogTotals = await this.getCoinDustLogTotals(allDustLogs, coin, currentCoinBtcPrice);
	// 	const coinDustlogs: DustLog[] = allDustLogs.filter((l: DustLog) => l.fromAsset === coin);
	// 	const lastDustLogDate: number = this.getLastDustLogDate(allDustLogs, coin);
	// 	const trades: Trade[] = await this.getSymbolTrades(coinPairs);
	//
	// 	let totalQty: number = 0 - coinDustLogTotals.totalQty;
	// 	let totalInvestedDollars: number = 0;
	// 	let totalInvestedDollarsCommission: number = 0;
	// 	let currentDollarsValue: number = 0;
	// 	let currentProfitLoss: number = 0;
	// 	let takenProfitLoss: number = 0;
	// 	let usdPrice: number = 0;
	//
	// 	for (const trade of trades) {
	// 		const qty: number = Number(trade.qty);
	// 		const price: number = Number(trade.price);
	// 		const time: number = Number(trade.time);
	//
	// 		const klineData: any = await BinanceApi.GetKlineData('BTCUSDT', '1m', time, time + 60000, 1);
	//
	// 		const prevBtcUsdtPrice: number = (Number(klineData[0][1]) + Number(klineData[0][4])) / 2; // Average between open and close
	// 		usdPrice = price * prevBtcUsdtPrice;
	//
	// 		let thisTradeInvestedDollars: number = 0;
	// 		if (trade.symbol.endsWith('BTC')) thisTradeInvestedDollars = qty * usdPrice;
	// 		else if (trade.symbol.endsWith('USDT')) thisTradeInvestedDollars = qty;
	// 		else if (trade.symbol.endsWith('BNB')) {
	// 			const klineData2: any = await BinanceApi.GetKlineData('BNBBUSD', '1m', time, time + 60000, 1);
	//
	// 			const prevBtcUsdtPrice2: number = (Number(klineData2[0][1]) + Number(klineData2[0][4])) / 2; // Average between open and close
	// 			usdPrice = price * prevBtcUsdtPrice2;
	// 			thisTradeInvestedDollars = qty * usdPrice;
	// 		} else if (trade.symbol.endsWith('ETH')) {
	// 			const klineData2: any = await BinanceApi.GetKlineData('ETHUSDT', '1m', time, time + 60000, 1);
	//
	// 			const prevBtcUsdtPrice2: number = (Number(klineData2[0][1]) + Number(klineData2[0][4])) / 2; // Average between open and close
	// 			usdPrice = price * prevBtcUsdtPrice2;
	// 			thisTradeInvestedDollars = qty * usdPrice;
	// 		}
	//
	// 		if (trade.isBuyer) {
	// 			totalInvestedDollars += thisTradeInvestedDollars;
	// 			totalQty += qty;
	// 		}
	// 		if (!trade.isBuyer) {
	// 			totalInvestedDollars -= thisTradeInvestedDollars;
	// 			totalQty -= qty;
	// 		}
	//
	// 		if (trade.commissionAsset === coin) {
	// 			totalInvestedDollarsCommission += (Number(trade.commission) * usdPrice);
	// 			totalQty -= Number(trade.commission);
	// 		}
	//
	// 		const thisTradeProfitLoss: number = currentDollarsValue - totalInvestedDollars;
	//
	// 		if (!trade.isBuyer) {
	// 			const percentageSold: number = (100 / totalInvestedDollars) * thisTradeInvestedDollars;
	// 			const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
	// 			takenProfitLoss += profitLossSold;
	// 			currentProfitLoss = thisTradeProfitLoss - profitLossSold;
	// 		}
	// 	}
	// 	currentDollarsValue = coinUsdPrice * totalQty;
	// 	currentProfitLoss = currentDollarsValue - totalInvestedDollars;
	//
	// 	const details: any = {
	// 		totalQty: Number(totalQty.toFixed(9)),
	// 		currentPrice: coinUsdPrice,
	// 		totalInvestedDollars,
	// 		totalInvestedDollarsCommission,
	// 		currentDollarsValue,
	// 		currentProfitLoss,
	// 		takenProfitLoss
	// 	};
	//
	// 	return {
	// 		counts: {
	// 			dustLogs: coinDustlogs.length,
	// 			trades: trades.length
	// 		},
	// 		symbols: trades.map((t: Trade) => t.symbol),
	// 		details,
	// 		trades,
	// 		lastDustLogDate,
	// 		dustLogs: coinDustlogs,
	// 		allDustLogs
	// 	};
	// }
}
