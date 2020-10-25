import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	PriceChangeStats,
	ErrorCode
} from '../../api-shared-modules/src';
import { TrendsService } from './trends.service';

export class TrendsController {

	public constructor(private trendsService: TrendsService) { }

	public getBestPerformers: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const limit: PriceChangeStats[] = await this.trendsService.getBestPerformers();

			return ResponseBuilder.ok({ stats: limit });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getBestPerformersByQuoteCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.quote)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const quote: string = event.pathParameters.quote;

		try {
			const sortedStats: PriceChangeStats[] = await this.trendsService.getBestPerformersByQuoteCurrency(quote);

			return ResponseBuilder.ok({ stats: sortedStats });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getPriceChangeStatsByBaseCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.base)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const base: string = event.pathParameters.base;

		try {
			const stats: PriceChangeStats[] = await this.trendsService.getPriceChangeStatsByBaseCurrency(base);

			return ResponseBuilder.ok({ stats });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public savePriceChangeStats: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try {
			const priceChangeStats: Array<Partial<PriceChangeStats>> = await this.trendsService.savePriceChangeStats();

			return ResponseBuilder.ok({ priceChangeStats });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public logNewPriceBatch: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		try { // Run by a cron job
			await this.trendsService.logNewPriceBatch();

			return ResponseBuilder.ok({ });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
