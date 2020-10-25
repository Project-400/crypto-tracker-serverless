import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { ExchangePair } from '../../api-shared-modules/src/types';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

export class ExchangePairsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangePairs = async (): Promise<ExchangePair[]> => {
		const binancePairs: Array<Partial<ExchangePair>> = await this.requestExchangePairs();

		const savedPairs: ExchangePair[] = [];

		await Promise.all(binancePairs.map(async (pair: ExchangePair) => {
			const savedPair: ExchangePair = await this.unitOfWork.ExchangePairs.saveExchangePair(pair);
			savedPairs.push(savedPair);
		}));

		return savedPairs;
	}

	public getSymbolExchangePair = async (symbol: string, quote: string): Promise<ExchangePair> => {
		let pair: ExchangePair;

		try {
			pair = await this.unitOfWork.ExchangePairs.getExchangePair(symbol, quote);
		} catch (err) {
			const pairs: Array<Partial<ExchangePair>> = await this.requestExchangePairs();

			const newPair: Partial<ExchangePair> = pairs.find((p: ExchangePair) => p.symbol === symbol);
			if (!newPair) throw Error(`${symbol} symbol exchange pair not found`);

			pair = await this.unitOfWork.ExchangePairs.saveExchangePair({ // Can this be just newPair passed in?
				symbol: newPair.symbol,
				base: newPair.base,
				quote: newPair.quote
			});
		}

		return pair;
	}

	public requestExchangePairs = async (): Promise<Array<Partial<ExchangePair>>> => {
		const info: GetExchangeInfoDto = await BinanceApi.GetExchangeInfo();
		return info.symbols.map((symbolData: ExchangeInfoSymbol) =>
			({
				symbol: symbolData.symbol,
				base: symbolData.baseAsset,
				quote: symbolData.quoteAsset
			}));
	}

}
