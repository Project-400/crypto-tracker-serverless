import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ExchangePair,
	BinanceExchangeInfoResponse,
	ErrorCode,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

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

			pair = await this.unitOfWork.ExchangePairs.saveExchangePair({
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

	private requestExchangePairs = async (): Promise<Array<Partial<ExchangePair>>> => {
		let dataString: string = '';

		const pairsString: string = await new Promise((resolve: any, reject: any): void => {
			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/exchangeInfo`, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		const info: BinanceExchangeInfoResponse = JSON.parse(pairsString);
		return info.symbols.map((symbolData: ExchangeInfoSymbol) =>
			({
				symbol: symbolData.symbol,
				base: symbolData.baseAsset,
				quote: symbolData.quoteAsset
			}));
	}

}
