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
import { GatherAllExchangeInfoCounts } from './exchange-info.interfaces';
import { Coin } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';

export class ExchangeInfoController {

	public constructor(private exchangeInfoService: ExchangeInfoService) { }

	public gatherAllExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const counts: GatherAllExchangeInfoCounts = await this.exchangeInfoService.gatherAllExchangeInfo();

			return ResponseBuilder.ok({ ...counts });
		} catch (err) {
			console.error(`Error trying to gathering all exchange info: ${err}`);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSymbolExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.symbol)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const symbol: string = event.pathParameters.symbol;

		try {
			const info: ExchangeInfoSymbol = await this.exchangeInfoService.getSymbolExchangeInfo(symbol);

			return ResponseBuilder.ok({ info });
		} catch (err) {
			console.error(`Error getting symbol exchange info: ${err}`);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getNonMainstreamPairs: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const nonMainStreamPairs: string[] = await this.exchangeInfoService.getNonMainstreamPairs();

			return ResponseBuilder.ok({ nonMainStreamPairs });
		} catch (err) {
			console.error(`Error getting non mainstream pairs: ${err}`);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllValidSymbols: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const symbols: ExchangeInfoSymbol[] = await this.exchangeInfoService.getTradingSymbolData();

			const symbolStrings: string[] = symbols.map((ei: ExchangeInfoSymbol) => ei.symbol).sort((a: string, b: string) => {
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			});

			return ResponseBuilder.ok({ symbols: symbolStrings });
		} catch (err) {
			console.error(`Error trying to gathering all exchange info: ${err}`);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
