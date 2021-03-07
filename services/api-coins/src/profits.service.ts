import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import {
	DustLog,
	DustLogRow, GetAllSymbolPricesDto,
	GetDustLogsDto,
	GetSymbolPriceDto
} from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { ExchangePair } from '../../api-shared-modules/src/types';
import { Trade } from '@crypto-tracker/common-types';
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
		const exchangePairs: ExchangePairsService = new ExchangePairsService(this.unitOfWork);
		const pairs: Array<Partial<ExchangePair>> = await exchangePairs.requestExchangePairs();
		const coinPairs: Array<Partial<ExchangePair>> = pairs.filter((p: ExchangePair) => p.base === coin);
		const trades: Trade[] = await this.getSymbolTrades(coinPairs);
		const allDustLogs: DustLog[] = await this.getDustLogs();
		const coinDustLogTotals: DustLogTotals = await this.getCoinDustLogTotals(allDustLogs, coin, currentCoinBtcPrice);

		let totalQty: number = 0 - coinDustLogTotals.totalQty;
		let totalInvestedValue: number = 0 - coinDustLogTotals.totalInvestedValue;
		let totalInvestedValueMinusCommission: number = 0 - coinDustLogTotals.totalInvestedValueMinusCommission;
		let currentValue: number = 0;
		let currentProfitLoss: number = 0;
		let takenProfitLoss: number = 0;
		let btcPrice: number = 0;

		trades.map((trade: Trade) => {
			// const totals: { value: number; costs: any } = sortedTrades.reduce((ts: { value: number; costs: any }, trade: any) => {
			// 	if (!ts.costs[trade.symbol]) ts.costs[trade.symbol] = 0;

			const qty: number = Number(trade.qty);
			const price: number = Number(trade.price);
			btcPrice = trade.symbol.endsWith('BTC') ? price : price / BTCUSDT_Price;
			const thisTradeInvestedValue: number = qty * btcPrice; // White
			const currentTotalValue: number = totalQty * btcPrice; // Blue

			if (trade.isBuyer) {
				totalInvestedValue += thisTradeInvestedValue;
				totalInvestedValueMinusCommission += thisTradeInvestedValue;
				totalQty += qty;
				currentValue = currentTotalValue + thisTradeInvestedValue;
			}
			if (!trade.isBuyer) {
				totalInvestedValue -= thisTradeInvestedValue;
				totalInvestedValueMinusCommission -= thisTradeInvestedValue;
				totalQty -= qty;
				currentValue = currentTotalValue - thisTradeInvestedValue;
			}

			if (trade.commissionAsset === coin) {
				totalInvestedValueMinusCommission -= (Number(trade.commission) * btcPrice);
				totalQty -= Number(trade.commission);
				currentValue = currentTotalValue - (Number(trade.commission) * btcPrice);
			}

			const thisTradeProfitLoss: number = currentValue - totalInvestedValue;

			if (!trade.isBuyer) {
				const percentageSold: number = (100 / currentTotalValue) * thisTradeInvestedValue;
				const profitLossSold: number = (thisTradeProfitLoss / 100) * percentageSold;
				takenProfitLoss += profitLossSold;
				currentProfitLoss = thisTradeProfitLoss - profitLossSold;
			}
		});

		// return ts;
		// }, { value: 0, costs: { } });

		currentValue = currentCoinBtcPrice * totalQty;
		currentProfitLoss = currentValue - totalInvestedValueMinusCommission;
		const diff: number = Number((((currentValue - totalInvestedValueMinusCommission) / totalInvestedValueMinusCommission) * 100).toFixed(2));

		const details: any = {
			totalQty: Number(totalQty.toFixed(9)),
			currentPrice: Number(this.BTCtoUSDT(BTCUSDT_Price, currentCoinBtcPrice).toFixed(7)),
			totalInvestedValue: this.BTCtoUSDTRounded(BTCUSDT_Price, totalInvestedValue),
			totalInvestedValueMinusCommission: this.BTCtoUSDTRounded(BTCUSDT_Price, totalInvestedValueMinusCommission),
			currentValue: this.BTCtoUSDTRounded(BTCUSDT_Price, currentValue),
			currentProfitLoss: this.BTCtoUSDTRounded(BTCUSDT_Price, currentProfitLoss),
			takenProfitLoss: this.BTCtoUSDTRounded(BTCUSDT_Price, takenProfitLoss),
			diff
		};

		return {
			details,
			diff,
			trades,
			dustLogs: allDustLogs.filter((l: DustLog) => l.fromAsset === coin),
			allDustLogs
		};
	}

	private getUsdValue = (coin: string, coinUsdtPrice: number, coinBusdPrice: number, coinBtcPrice: number,
						   coinEthPrice: number, coinBnbPrice: number, BTCUSDT_Price: number,
						   ETHUSDT_Price: number, BNBBUSD_Price: number): number => {
		const usdValue: number =
			coinUsdtPrice ||
			coinBusdPrice ||
			(coinBtcPrice ? this.btcToUsd(BTCUSDT_Price, coinBtcPrice) : false) ||
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

	private getSymbolTrades = async (coinPairs: Array<Partial<ExchangePair>>): Promise<Trade[]> => {
		const trades: Trade[] = [];

		await Promise.all(
			coinPairs.map(async (pair: Partial<ExchangePair>) => {
				const t: Trade[] = await BinanceApi.GetSymbolTrades(pair.symbol);
				trades.push(...t);
			})
		);

		return _.sortBy(trades, 'time');
	}

	private getDustLogs = async (): Promise<DustLog[]> => {
		const dustLogsDetails: GetDustLogsDto = await BinanceApi.GetDustLogs();

		if (!dustLogsDetails.results.total) return [];

		return dustLogsDetails.results.rows.reduce((allLogs: DustLog[], logRow: DustLogRow) => {
			allLogs.push(...logRow.logs);
			return allLogs;
		}, []);
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

}
