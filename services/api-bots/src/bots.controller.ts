import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ErrorCode,
	LastEvaluatedKey,
	ResponseBuilder,
	UnitOfWork,
} from '../../api-shared-modules/src';
import { ITraderBotLogData } from '@crypto-tracker/common-types';
import Auth, { TokenVerification } from '../../_auth/verify';
import { BotType, ITraderBot, TradingBotState } from '../../api-shared-modules/src/models/core/TraderBot';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import { BotsPageResponse } from '../../api-shared-modules/src/data-access/repositories/TraderBotRepository';

export class BotsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.botId || !event.queryStringParameters.createdAt)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const botId: string = event.queryStringParameters.botId;
		const createdAt: string = event.queryStringParameters.createdAt;

		try {
			const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllTradingBots: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		Auth.VerifyToken(''); // TODO: Check admin account
		const limit: number = event.queryStringParameters ? Number(event.queryStringParameters.limit) || 10 : 10;
		const lastEvaluatedKey: LastEvaluatedKey = event.headers.lastEvaluatedKey ? JSON.parse(event.headers.lastEvaluatedKey) : undefined;

		try {
			const bots: BotsPageResponse = await this.unitOfWork.TraderBot.getAll(lastEvaluatedKey, limit);

			return ResponseBuilder.ok({ bots });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getAllUserTradingBotsByState: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.states)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const combinedStates: string = event.queryStringParameters.states;
		const limit: number = Number(event.queryStringParameters.limit) || 10;
		const states: string[] = combinedStates.split(',').map((s: string) => s.toUpperCase().trim());
		const lastEvaluatedKey: LastEvaluatedKey = event.headers.lastEvaluatedKey ? JSON.parse(event.headers.lastEvaluatedKey) : undefined;

		try {
			states.forEach((s: string) => {
				if (!(s in TradingBotState)) throw Error('Invalid Bot State');
			});

			const bots: BotsPageResponse = await this.unitOfWork.TraderBot.getAllByUserAndStates(userId, states, lastEvaluatedKey, limit);

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
			states.forEach((s: string) => {
				if (!(s in TradingBotState)) throw Error('Invalid Bot State');
			});

			const bots: BotsPageResponse = await this.unitOfWork.TraderBot.getAllByStates(states, lastEvaluatedKey, limit);

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

		const bot: Partial<ITraderBot> = {
			userId,
			symbol,
			botType: BotType.SHORT_TERM,
			botState: TradingBotState.WAITING
		};

		try {
			const priceData: GetSymbolPriceDto = await BinanceApi.GetSymbolPrice(symbol); // Using price endpoint as alternative
			if (priceData.code !== undefined || priceData.msg === 'Invalid symbol.') throw Error('Cryptocurrency symbol not found');

			const result: ITraderBot = await this.unitOfWork.TraderBot.create(userId, bot);

			// TODO: Implement call to bot service
			// Possibly let this endpoint return & notify bot startup via Websocket

			return ResponseBuilder.ok({ bot: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public stopTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { botId: string, createdAt: string } = JSON.parse(event.body);
		if (!data.botId || !data.createdAt) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const botId: string = data.botId;
		const createdAt: string = data.createdAt;

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

			bot.botState = TradingBotState.FINISHING;
			bot.times.stoppingAt = new Date().toISOString();

			const finishingResult: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

			console.log(finishingResult.botId); // Pass into bot service
			// TODO: Implement call to bot service

			bot.botState = TradingBotState.FINISHED;
			bot.times.startConfirmedAt = new Date().toISOString();

			const finishedBot: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

			return ResponseBuilder.ok({ bot: finishedBot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public pauseTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { botId: string, createdAt: string } = JSON.parse(event.body);
		if (!data.botId || !data.createdAt) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const botId: string = data.botId;
		const createdAt: string = data.createdAt;

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

			bot.botState = TradingBotState.PAUSING;
			bot.times.pausedAt = new Date().toISOString();

			const finishingResult: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

			console.log(finishingResult.botId); // Pass into bot service
			// TODO: Implement call to bot service

			bot.botState = TradingBotState.PAUSED;
			bot.times.pauseConfirmedAt = new Date().toISOString();

			const finishedBot: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

			return ResponseBuilder.ok({ bot: finishedBot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public shutDownAllTraderBots: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		// TODO: Check is admin account

		try {
			let activeBots: BotsPageResponse;
			let count: number = 0;

			do {
				activeBots = await this.unitOfWork.TraderBot.getAllByStates([
					TradingBotState.WAITING,
					TradingBotState.TRADING,
					TradingBotState.PAUSING,
					TradingBotState.PAUSED
				], activeBots ? activeBots.lastEvaluatedKey : undefined, 10);

				await Promise.all(activeBots.bots.map(async (bot: ITraderBot) => {
					bot.botState = TradingBotState.SHUTTING_DOWN;
					bot.times.shuttingDownAt = new Date().toISOString();

					await this.unitOfWork.TraderBot.update(userId, bot);
				}));

				// TODO: Implement call to bot service to shutdown all

				await Promise.all(activeBots.bots.map(async (bot: ITraderBot) => {
					bot.botState = TradingBotState.SHUT_DOWN;
					bot.times.shutdownConfirmedAt = new Date().toISOString();

					await this.unitOfWork.TraderBot.update(userId, bot);
				}));

				count += activeBots.bots.length;
			} while (activeBots.lastEvaluatedKey);

			return ResponseBuilder.ok({ count });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getTraderBotLogData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.botId || !event.queryStringParameters.createdAt)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const botId: string = event.queryStringParameters.botId;
		const createdAt: string = event.queryStringParameters.createdAt;

		try {
			const bot: ITraderBot = await this.unitOfWork.BotTradeData.get(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public saveTraderBotLogData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: ITraderBotLogData = JSON.parse(event.body).tradeData;

		if (!data.botId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Missing Bot ID');

		await this.unitOfWork.BotTradeData.createTradeBotData(data);

		try {
			return ResponseBuilder.ok({ saved: true });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
