import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ExchangePair,
	BinanceExchangeInfoResponse,
	BinanceExchangeInfoSymbol,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';

export class ExchangePairsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangePairs: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
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
		const pairs: Array<Partial<ExchangePair>> = info.symbols.map((symbolData: BinanceExchangeInfoSymbol) =>
			({
				symbol: symbolData.symbol,
				base: symbolData.baseAsset,
				quote: symbolData.quoteAsset
			}));

		await Promise.all(pairs.map((pair: ExchangePair) => this.unitOfWork.ExchangePairs.saveExchangePair(pair)));

		try {
			return ResponseBuilder.ok({ pairs });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
