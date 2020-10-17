import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ExchangePair,
	ErrorCode,
} from '../../api-shared-modules/src';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';

export class ExchangePairsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangePairs: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const pairs: Array<Partial<ExchangePair>> = await this.requestExchangePairs();

		await Promise.all(pairs.map((pair: ExchangePair) => this.unitOfWork.ExchangePairs.saveExchangePair(pair)));

		try {
			return ResponseBuilder.ok({ pairs });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSymbolExchangePair: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.symbol || !event.pathParameters.quote)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		let pair: ExchangePair;

		try {
			pair = await this.unitOfWork.ExchangePairs.getExchangePair(event.pathParameters.symbol, event.pathParameters.quote);
		} catch (err) {
			const pairs: Array<Partial<ExchangePair>> = await this.requestExchangePairs();

			const newPair: Partial<ExchangePair> = pairs.find((p: ExchangePair) => p.symbol === event.pathParameters.symbol);
			if (!newPair) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Symbol exchange info not found');

			pair = await this.unitOfWork.ExchangePairs.saveExchangePair({ // Can this be just newPair passed in?
				symbol: newPair.symbol,
				base: newPair.base,
				quote: newPair.quote
			});
		}

		try {
			return ResponseBuilder.ok({ info: pair });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
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
