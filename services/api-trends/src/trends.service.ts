import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { ExchangePair, PairPrice, PriceBatch, PriceChangeStats } from '../../api-shared-modules/src/types';
import { SeparatedPriceBatches } from './trends.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

export class TrendsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getBestPerformers = async (): Promise<PriceChangeStats[]> => {
		const stats: PriceChangeStats[] = await this.unitOfWork.PriceChangeStats.getAllPriceChangeStats();
		const sortedStats: PriceChangeStats[] = this.sortStats(stats);
		return sortedStats.slice(0, 20);
	}

	public getBestPerformersByQuoteCurrency = async (quote: string): Promise<PriceChangeStats[]> => {
		const stats: PriceChangeStats[] = await this.unitOfWork.PriceChangeStats.getPriceChangeStatsByQuote(quote);
		return this.sortStats(stats);
	}

	public getPriceChangeStatsByBaseCurrency = async (base: string): Promise<PriceChangeStats[]> =>
		this.unitOfWork.PriceChangeStats.getPriceChangeStatsByBase(base)

	public savePriceChangeStats = async (): Promise<Array<Partial<PriceChangeStats>>> => {
		const exchangePairs: ExchangePair[] = await this.unitOfWork.ExchangePairs.getAllPairs();

		const priceChangeStats: Array<Partial<PriceChangeStats>> = exchangePairs.map((pair: ExchangePair) =>
			({
				symbol: pair.symbol,
				base: pair.base,
				quote: pair.quote,
				previousPrices: {
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
				pricePercentageChanges: {
					min5: 0,
					min10: 0,
					min30: 0,
					hour: 0,
					hour3: 0,
					hour6: 0,
					hour12: 0,
					hour24: 0
				},
				currentPrice: 0
			}));

		await Promise.all(priceChangeStats.map((stats: PriceChangeStats) =>
			this.unitOfWork.PriceChangeStats.savePriceChangeStats(stats)));

		return priceChangeStats;
	}

	public logNewPriceBatch = async (): Promise<void> => {
		const prices: PairPrice[] = await BinanceApi.GetAllSymbolPrices();

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

		await Promise.all(Object.keys(separatedBatches).map((quote: string) =>
			this.unitOfWork.PriceBatches.savePriceBatch(separatedBatches[quote], quote)));

		await this.updatePriceTrends(separatedBatches);
	}

	private sortStats = (stats: PriceChangeStats[]): PriceChangeStats[] =>
		stats.sort((a: PriceChangeStats, b: PriceChangeStats) => {
			if (a.pricePercentageChanges.min5 < b.pricePercentageChanges.min5) return 1;
			if (a.pricePercentageChanges.min5 > b.pricePercentageChanges.min5) return -1;
			return 0;
		})

	private updatePriceTrends = async (separatedBatches: SeparatedPriceBatches): Promise<PriceChangeStats[]> => {
		const fiveMintutesAgo: string = this.previousTime(5);
		const tenMintutesAgo: string = this.previousTime(10);
		const thirtyMintutesAgo: string = this.previousTime(30);
		const oneHourAgo: string = this.previousTime(60);
		const threeHoursAgo: string = this.previousTime(3 * 60);
		const sixHoursAgo: string = this.previousTime(6 * 60);
		const twelveHoursAgo: string = this.previousTime(12 * 60);
		const oneDayAgo: string = this.previousTime(24 * 60);

		const fiveMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(fiveMintutesAgo);
		const tenMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(tenMintutesAgo);
		const thirtyMinutesBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(thirtyMintutesAgo);
		const oneHourBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(oneHourAgo);
		const threeHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(threeHoursAgo);
		const sixHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(sixHoursAgo);
		const twelveHoursBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(twelveHoursAgo);
		const oneDayBatches: PriceBatch[] = await this.unitOfWork.PriceBatches.getPriceBatches(oneDayAgo);

		const stats: PriceChangeStats[] = await this.unitOfWork.PriceChangeStats.getAllPriceChangeStats();

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			fiveMinutesBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.min5 = pairPrice.price;
					matchingStats.priceChanges.min5 = diff;
					matchingStats.pricePercentageChanges.min5 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			tenMinutesBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.min10 = pairPrice.price;
					matchingStats.priceChanges.min10 = diff;
					matchingStats.pricePercentageChanges.min10 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			thirtyMinutesBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.min30 = pairPrice.price;
					matchingStats.priceChanges.min30 = diff;
					matchingStats.pricePercentageChanges.min30 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			oneHourBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.hour = pairPrice.price;
					matchingStats.priceChanges.hour = diff;
					matchingStats.pricePercentageChanges.hour = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			threeHoursBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.hour3 = pairPrice.price;
					matchingStats.priceChanges.hour3 = diff;
					matchingStats.pricePercentageChanges.hour3 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			sixHoursBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.hour6 = pairPrice.price;
					matchingStats.priceChanges.hour6 = diff;
					matchingStats.pricePercentageChanges.hour6 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			twelveHoursBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.hour12 = pairPrice.price;
					matchingStats.priceChanges.hour12 = diff;
					matchingStats.pricePercentageChanges.hour12 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		Object.keys(separatedBatches).map((quote: string) => {
			const updatedBatch: PairPrice[] = separatedBatches[quote];

			oneDayBatches.filter((batch: PriceBatch) => batch.quote === quote).map((batch: PriceBatch) => {
				batch.prices.map((pairPrice: PairPrice) => {
					const matching: PairPrice = updatedBatch.find((updatedPairPrice: PairPrice) => pairPrice.symbol === updatedPairPrice.symbol);
					const matchingStats: PriceChangeStats = stats.find((s: PriceChangeStats) => pairPrice.symbol === s.symbol);
					if (!matching || !matchingStats) return;
					const diff: number = matching.price - pairPrice.price;
					const pcDiff: number = (diff / pairPrice.price) * 100;

					matchingStats.currentPrice = matching.price;
					matchingStats.previousPrices.hour24 = pairPrice.price;
					matchingStats.priceChanges.hour24 = diff;
					matchingStats.pricePercentageChanges.hour24 = pcDiff;
					matchingStats.times.updatedAt = new Date().toISOString();
				});
			});
		});

		return Promise.all(stats.map((s: PriceChangeStats) =>
			this.unitOfWork.PriceChangeStats.update(s.symbol, s)));
	}

	private previousTime = (minutes: number): string => {
		const millis: number = 1000 * 60 * minutes;
		const fiveMins: number = 1000 * 60 * 5;
		return new Date((Math.round(Date.now() / fiveMins) * fiveMins) - millis).toISOString();
	}

}
