import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	PairPrice,
	PriceBatch, ExchangePair, PriceChangeStats,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';

export class TrendsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	// public getBestPerformers: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
	// 	const dataString: string = await new Promise((resolve: any, reject: any): void => {
	// 		let ds: string = '';
	//
	// 		const req: ClientRequest = https.get(`https://api.binance.com/api/v3/ticker/price`, {
	// 			headers: {
	// 				'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
	// 			}
	// 		}, (res: IncomingMessage) => {
	// 			res.on('data', (chunk: any) => ds += chunk);
	// 			res.on('end', () => {
	// 				resolve(ds);
	// 			});
	// 		});
	//
	// 		req.on('error', reject);
	// 	});
	//
	// 	const prices: PairPrice[] = JSON.parse(dataString);
	//
	// 	const separatedBatches: SeparatedPriceBatches = prices.reduce((sep: SeparatedPriceBatches, pair: PairPrice) => {
	// 		const symbol: string = pair.symbol.toUpperCase();
	// 		if (symbol.endsWith('USDT')) sep.USDT.push(pair);
	// 		else if (symbol.endsWith('BTC')) sep.BTC.push(pair);
	// 		else if (symbol.endsWith('BNB')) sep.BNB.push(pair);
	// 		else if (symbol.endsWith('ETH')) sep.ETH.push(pair);
	// 		else if (symbol.endsWith('XRP')) sep.XRP.push(pair);
	// 		else if (symbol.endsWith('BUSD')) sep.BUSD.push(pair);
	// 		else if (symbol.endsWith('TUSD')) sep.TUSD.push(pair);
	// 		else if (symbol.endsWith('USDC')) sep.USDC.push(pair);
	// 		else if (symbol.endsWith('EUR')) sep.EUR.push(pair);
	// 		else if (symbol.endsWith('GBP')) sep.GBP.push(pair);
	// 		else if (symbol.endsWith('PAX')) sep.PAX.push(pair);
	// 		else sep.OTHER.push(pair);
	// 		return sep;
	// 	}, {
	// 		USDT: [],
	// 		BTC: [],
	// 		BNB: [],
	// 		ETH: [],
	// 		XRP: [],
	// 		BUSD: [],
	// 		TUSD: [],
	// 		USDC: [],
	// 		PAX: [],
	// 		EUR: [],
	// 		GBP: [],
	// 		OTHER: []
	// 	});
	//
	// 	await Promise.all(Object.keys(separatedBatches).map((base: string) =>
	// 		this.unitOfWork.PriceBatches.savePriceBatch(separatedBatches[base], base)));
	//
	// 	try {
	// 		return ResponseBuilder.ok({ totalPairs: prices.length, batches: Object.keys(separatedBatches).length });
	// 	} catch (err) {
	// 		return ResponseBuilder.internalServerError(err, err.message);
	// 	}
	// }

	public savePriceChangeStats: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const exchangePairs: ExchangePair[] = await this.unitOfWork.ExchangePairs.getAllPairs();

		const priceChangeStats: Array<Partial<PriceChangeStats>> = exchangePairs.map((pair: ExchangePair) =>
			({
				symbol: pair.symbol,
				prices: {
					min5: 0,
					min10: 0,
					min30: 0,
					hour: 0,
					hour3: 0,
					hour6: 0,
					hour12: 0,
					hour24: 0
				},
				priceChanges: {
					min5: 0,
					min10: 0,
					min30: 0,
					hour: 0,
					hour3: 0,
					hour6: 0,
					hour12: 0,
					hour24: 0
				},
				currentPrice: 0,
				times: {
					createdAt: '',
					updatedAt: ''
				}
			}));

		await Promise.all(priceChangeStats.map((stats: PriceChangeStats) =>
			this.unitOfWork.PriceChangeStats.savePriceChangeStatsBatch(stats)));

		try {
			return ResponseBuilder.ok({ priceChangeStats });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public logNewPriceBatch: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const dataString: string = await new Promise((resolve: any, reject: any): void => {
			let ds: string = '';

			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/ticker/price`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => ds += chunk);
				res.on('end', () => {
					resolve(ds);
				});
			});

			req.on('error', reject);
		});

		const prices: PairPrice[] = JSON.parse(dataString);

		const separatedBatches: SeparatedPriceBatches = prices.reduce((sep: SeparatedPriceBatches, pair: PairPrice) => {
			const symbol: string = pair.symbol.toUpperCase();
			if (symbol.endsWith('USDT')) sep.USDT.push(pair);
			else if (symbol.endsWith('BTC')) sep.BTC.push(pair);
			else if (symbol.endsWith('BNB')) sep.BNB.push(pair);
			else if (symbol.endsWith('ETH')) sep.ETH.push(pair);
			else if (symbol.endsWith('XRP')) sep.XRP.push(pair);
			else if (symbol.endsWith('BUSD')) sep.BUSD.push(pair);
			else if (symbol.endsWith('TUSD')) sep.TUSD.push(pair);
			else if (symbol.endsWith('USDC')) sep.USDC.push(pair);
			else if (symbol.endsWith('EUR')) sep.EUR.push(pair);
			else if (symbol.endsWith('GBP')) sep.GBP.push(pair);
			else if (symbol.endsWith('PAX')) sep.PAX.push(pair);
			else sep.OTHER.push(pair);
			return sep;
		}, {
			USDT: [],
			BTC: [],
			BNB: [],
			ETH: [],
			XRP: [],
			BUSD: [],
			TUSD: [],
			USDC: [],
			PAX: [],
			EUR: [],
			GBP: [],
			OTHER: []
		});

		console.log(separatedBatches);

		// await Promise.all(Object.keys(separatedBatches).map((base: string) =>
		// 	this.unitOfWork.PriceBatches.savePriceBatch(separatedBatches[base], base)));

		const pulled: PriceBatch[] = await this.updatePriceTrends(separatedBatches);

		try {
			return ResponseBuilder.ok({
				totalPairs: prices.length,
				batches:
				Object.keys(separatedBatches).length,
				pulled,
				pulledCount: pulled.length
			});
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private updatePriceTrends = async (separatedBatches: SeparatedPriceBatches): Promise<PriceBatch[]> => {
		const fiveMintutesAgo: string = this.previousTime(5);
		// const tenMintutesAgo: string = this.previousTime(10);
		// const thirtyMintutesAgo: string = this.previousTime(30);
		// const oneHourAgo: string = this.previousTime(60);
		// const threeHoursAgo: string = this.previousTime(3 * 60);
		// const sixHoursAgo: string = this.previousTime(6 * 60);
		// const twelveHoursAgo: string = this.previousTime(12 * 60);
		// const oneDayAgo: string = this.previousTime(24 * 60);

		const fiveMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(fiveMintutesAgo);
		// const tenMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(tenMintutesAgo);
		// const thirtyMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(thirtyMintutesAgo);
		// const oneHourBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(oneHourAgo);
		// const threeHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(threeHoursAgo);
		// const sixHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(sixHoursAgo);
		// const twelveHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(twelveHoursAgo);
		// const oneDayBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(oneDayAgo);
		//
		// const stats: Array<Partial<PriceChangeStats>> = [];
		// const updatedUSDT: PairPrice[] = separatedBatches.USDT;
		// const previousUSDT: PairPrice[] = fiveMinutesBatches.find((batch: PriceBatch) => batch.base === 'USDT').prices;
		//
		// previousUSDT.forEach((pairPrice: PairPrice) => {
		// 	const matching: PairPrice = updatedUSDT.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
		// 	const diff: number = matching.price - pairPrice.price;
		// 	const pc: number = (diff / pairPrice.price) * 100;
		//
		// 	stats.push({
		// 		pairSymbol: matching.symbol,
		// 		prices: {
		// 			min5: diff
		// 			// min10: number;
		// 			// min30: number;
		// 			// hour: number;
		// 			// hour3: number;
		// 			// hour6: number;
		// 			// hour12: number;
		// 			// hour24: number;
		// 		},
		// 		priceChange: {
		// 			min5: pc
		// 			// min10: number;
		// 			// min30: number;
		// 			// hour: number;
		// 			// hour3: number;
		// 			// hour6: number;
		// 			// hour12: number;
		// 			// hour24: number;
		// 		},
		// 		currentPrice: matching.price
		// 	});
		// });

		return fiveMinutesBatches;
	}

	private previousTime = (minutes: number): string => {
		const millis: number = 1000 * 60 * minutes;
		const date: Date = new Date(Date.now() - millis);
		return new Date(Math.round(date.getTime() / millis) * millis).toISOString();
	}
}

interface SeparatedPriceBatches {
	USDT: PairPrice[],
	BTC: PairPrice[],
	BNB: PairPrice[],
	ETH: PairPrice[],
	XRP: PairPrice[],
	BUSD: PairPrice[],
	TUSD: PairPrice[],
	USDC: PairPrice[],
	PAX: PairPrice[],
	EUR: PairPrice[],
	GBP: PairPrice[],
	OTHER: PairPrice[]
}
