import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ErrorCode,
	LastEvaluatedKey,
	ResponseBuilder
} from '../../api-shared-modules/src';
import { IBotTradeData } from '@crypto-tracker/common-types';
import Auth, { TokenVerification } from '../../_auth/verify';
import { ITraderBot } from '../../api-shared-modules/src/models/core/TraderBot';
import { BotsPageResponse } from '../../api-shared-modules/src/data-access/repositories/TraderBotRepository';
import { BotsService } from './bots.service';

export class BotsController {

	public constructor(private botsService: BotsService) { }

	public getTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.botId || !event.queryStringParameters.createdAt)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const botId: string = event.queryStringParameters.botId;
		const createdAt: string = event.queryStringParameters.createdAt;

		try {
			const bot: ITraderBot = await this.botsService.getTraderBot(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllTradingBots: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		Auth.VerifyToken(''); // TODO: Check admin account
		const limit: number = event.queryStringParameters && Number(event.queryStringParameters.limit);
		const lastEvaluatedKey: LastEvaluatedKey = event.headers.lastEvaluatedKey ? JSON.parse(event.headers.lastEvaluatedKey) : undefined;

		try {
			const bots: BotsPageResponse = await this.botsService.getAllTradingBots(lastEvaluatedKey, limit);

			return ResponseBuilder.ok({ bots });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllUserTradingBotsByState: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.states)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		// const auth: TokenVerification = Auth.VerifyToken('');
		// const userId: string = auth.sub;
		const userId: string = event.pathParameters.userSub;
		const limit: number = Number(event.queryStringParameters.limit);
		const combinedStates: string = event.queryStringParameters.states;
		const states: string[] = combinedStates.split(',').map((s: string) => s.toUpperCase().trim());
		const lastEvaluatedKey: LastEvaluatedKey = event.headers.lastEvaluatedKey ? JSON.parse(event.headers.lastEvaluatedKey) : undefined;

		try {
			const bots: BotsPageResponse = await this.botsService.getAllUserTradingBotsByState(userId, states, lastEvaluatedKey, limit);

			return ResponseBuilder.ok({ bots });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllTradingBotsByState: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.states)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		Auth.VerifyToken(''); // TODO: Check admin account
		const combinedStates: string = event.queryStringParameters.states;
		const limit: number = Number(event.queryStringParameters.limit) || 10;
		const states: string[] = combinedStates.split(',').map((s: string) => s.toUpperCase().trim());
		const lastEvaluatedKey: LastEvaluatedKey = event.headers.lastEvaluatedKey ? JSON.parse(event.headers.lastEvaluatedKey) : undefined;

		try {
			const bots: BotsPageResponse = await this.botsService.getAllTradingBotsByState(states, lastEvaluatedKey, limit);

			return ResponseBuilder.ok({ bots });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { symbol: string } = JSON.parse(event.body);
		const symbol: string = data.symbol;
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const result: ITraderBot = await this.botsService.createTraderBot(userId, symbol);

			return ResponseBuilder.ok({ bot: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public stopTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { botId: string; createdAt: string } = JSON.parse(event.body);
		if (!data.botId || !data.createdAt) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const botId: string = data.botId;
		const createdAt: string = data.createdAt;
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const finishedBot: ITraderBot = await this.botsService.stopTraderBot(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot: finishedBot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public pauseTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { botId: string; createdAt: string } = JSON.parse(event.body);
		if (!data.botId || !data.createdAt) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const botId: string = data.botId;
		const createdAt: string = data.createdAt;
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const finishedBot: ITraderBot = await this.botsService.pauseTraderBot(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot: finishedBot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public shutDownAllTraderBots: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		Auth.VerifyToken('');

		// TODO: Check is admin account

		try {
			const shutdownCount: number = await this.botsService.shutDownAllTraderBots();

			return ResponseBuilder.ok({ shutdownCount });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getTraderBotLogData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.botId)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const botId: string = event.queryStringParameters.botId;

		try {
			const data: IBotTradeData = await this.botsService.getTraderBotLogData(userId, botId);

			return ResponseBuilder.ok({ data });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot Log Data not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public saveTraderBotLogData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: IBotTradeData = JSON.parse(event.body);
		if (!data.botId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Missing Bot ID');

		try {
			const result: IBotTradeData = await this.botsService.saveTraderBotLogData(data);

			return ResponseBuilder.ok({ result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
