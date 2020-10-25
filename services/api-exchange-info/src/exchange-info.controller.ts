import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	ErrorCode
} from '../../api-shared-modules/src';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { ExchangeInfoService } from './exchange-info.service';

export class ExchangeInfoController {

	public constructor(private exchangeInfoService: ExchangeInfoService) { }

	public gatherAllExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const count: number = await this.exchangeInfoService.gatherAllExchangeInfo();

			return ResponseBuilder.ok({ count });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSymbolExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (
			!event.pathParameters ||
			!event.pathParameters.symbol ||
			!event.pathParameters.quote
		) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const symbol: string = event.pathParameters.symbol;
		const quote: string = event.pathParameters.quote;

		try {
			const info: ExchangeInfoSymbol = await this.exchangeInfoService.getSymbolExchangeInfo(symbol, quote);

			return ResponseBuilder.ok({ info });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
