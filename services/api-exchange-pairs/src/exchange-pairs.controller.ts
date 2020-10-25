import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	ExchangePair,
	ErrorCode
} from '../../api-shared-modules/src';
import { ExchangePairsService } from './exchange-pairs.service';

export class ExchangePairsController {

	public constructor(private exchangePairsService: ExchangePairsService) { }

	public gatherAllExchangePairs: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const pairs: ExchangePair[] = await this.exchangePairsService.gatherAllExchangePairs();

			return ResponseBuilder.ok({ pairs });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSymbolExchangePair: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.symbol || !event.pathParameters.quote)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const symbol: string = event.pathParameters.symbol;
		const quote: string = event.pathParameters.quote;

		try {
			const pair: ExchangePair = await this.exchangePairsService.getSymbolExchangePair(symbol, quote);

			return ResponseBuilder.ok({ info: pair });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
