import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork, ErrorCode,
} from '../../api-shared-modules/src';
import { ISymbolTraderData } from '@crypto-tracker/common-types';

export class BotsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public saveTradeBotData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: ISymbolTraderData = JSON.parse(event.body).tradeData;

		await this.unitOfWork.BotTradeData.saveTradeBotData(data);

		try {
			return ResponseBuilder.ok({ saved: true });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
