import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { BotType, ITraderBot, TradingBotState } from '../../api-shared-modules/src/models/core/TraderBot';
import { BotsPageResponse } from '../../api-shared-modules/src/data-access/repositories/TraderBotRepository';
import { LastEvaluatedKey } from '../../api-shared-modules/src/types';
import { IBotTradeData } from '@crypto-tracker/common-types';
import BotServiceApi from '../../api-shared-modules/src/external-apis/bot-service/bot-service';
import { GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

export class BotsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getTraderBot = async (userId: string, botId: string, createdAt: string): Promise<ITraderBot> =>
		this.unitOfWork.TraderBot.get(userId, botId, createdAt)

	public getAllTradingBots = async (lastEvaluatedKey?: LastEvaluatedKey, limit?: number): Promise<BotsPageResponse> =>
		this.unitOfWork.TraderBot.getAll(lastEvaluatedKey, limit || 10)

	public getAllUserTradingBotsByState = async (userId: string, states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number):
		Promise<BotsPageResponse> => {
		this.validateBotStates(states);

		return this.unitOfWork.TraderBot.getAllByUserAndStates(userId, states, lastEvaluatedKey, limit || 10);
	}

	public getAllUserTradingBots = async (userId: string, lastEvaluatedKey?: LastEvaluatedKey, limit?: number):
		Promise<BotsPageResponse> => {
		return this.unitOfWork.TraderBot.getAllByUser(userId, lastEvaluatedKey, limit || 10);
	}

	public getAllTradingBotsByState = async (states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number):
		Promise<BotsPageResponse> => {
		this.validateBotStates(states);

		return this.unitOfWork.TraderBot.getAllByStates(states, lastEvaluatedKey, limit);
	}

	public createTraderBot = async (userId: string, symbol: string): Promise<ITraderBot> => {
		const botDetails: Partial<ITraderBot> = {
			userId,
			symbol,
			botType: BotType.SHORT_TERM,
			botState: TradingBotState.WAITING
		};

		const priceData: GetSymbolPriceDto = await BinanceApi.GetSymbolPrice(symbol); // Using price endpoint as alternative
		if (priceData.code !== undefined || priceData.msg === 'Invalid symbol.') throw Error('Cryptocurrency symbol not found');

		const bot: ITraderBot = await this.unitOfWork.TraderBot.create(userId, botDetails);

		let deployment: any;
		try {
			deployment = await BotServiceApi.DeployTraderBot(bot.botId);
		} catch (e) {
			throw Error('Failed to deploy trader bot - Server not responsive');
		}

		if (!deployment || !deployment.success || !deployment.bot) throw Error('Failed to deploy trader bot - Data missing');

		bot.times.startConfirmedAt = new Date().toISOString();
		bot.botState = TradingBotState.TRADING;

		return this.unitOfWork.TraderBot.update(bot);
	}

	public stopTraderBot = async (userId: string, botId: string, createdAt: string): Promise<ITraderBot> => {
		const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

		bot.botState = TradingBotState.FINISHING;
		bot.times.stoppingAt = new Date().toISOString();

		const stoppingResult: ITraderBot = await this.unitOfWork.TraderBot.update(bot);

		let stopOperation: any;
		try {
			stopOperation = await BotServiceApi.StopTraderBot(stoppingResult.botId);
		} catch (e) {
			throw Error('Failed to stop trader bot - Server not responsive');
		}

		if (!stopOperation || !stopOperation.success || !stopOperation.bot) throw Error('Failed to stop trader bot - Data missing');

		bot.botState = TradingBotState.FINISHED;
		bot.times.startConfirmedAt = new Date().toISOString();

		return this.unitOfWork.TraderBot.update(bot);
	}

	public pauseTraderBot = async (userId: string, botId: string, createdAt: string): Promise<ITraderBot> => {
		const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

		bot.botState = TradingBotState.PAUSING;
		bot.times.pausedAt = new Date().toISOString();

		const pausingResult: ITraderBot = await this.unitOfWork.TraderBot.update(bot);

		let pauseOperation: any;
		try {
			pauseOperation = await BotServiceApi.PauseTraderBot(pausingResult.botId);
		} catch (e) {
			throw Error('Failed to pause trader bot - Server not responsive');
		}

		if (!pauseOperation || !pauseOperation.success || !pauseOperation.bot) throw Error('Failed to pause trader bot - Data missing');

		bot.botState = TradingBotState.PAUSED;
		bot.times.pauseConfirmedAt = new Date().toISOString();

		return this.unitOfWork.TraderBot.update(bot);
	}

	public shutDownAllTraderBots = async (): Promise<number> => {
		let activeBots: BotsPageResponse;
		let count: number = 0;

		do {
			activeBots = await this.unitOfWork.TraderBot.getAllByStates([
				TradingBotState.WAITING,
				TradingBotState.TRADING,
				TradingBotState.PAUSING,
				TradingBotState.PAUSED
			], activeBots ? activeBots.lastEvaluatedKey : undefined, 10);

			try {
				await BotServiceApi.HealthCheck();
			} catch (e) {
				throw Error('Bot service health check failed');
			}

			await Promise.all(activeBots.bots.map(async (bot: ITraderBot) => {
				bot.botState = TradingBotState.SHUTTING_DOWN;
				bot.times.shuttingDownAt = new Date().toISOString();

				await this.unitOfWork.TraderBot.update(bot);
			}));

			let shutdownOperation: any;
			try {
				shutdownOperation = await BotServiceApi.ShutdownAllTraderBots();
			} catch (e) {
				throw Error('Failed to shutdown all trader bots - Server not responsive');
			}

			if (!shutdownOperation || !shutdownOperation.success || shutdownOperation.count === undefined) throw Error('Failed to shutdown all trader bots - Data missing');

			await Promise.all(activeBots.bots.map(async (bot: ITraderBot) => {
				bot.botState = TradingBotState.SHUT_DOWN;
				bot.times.shutdownConfirmedAt = new Date().toISOString();

				await this.unitOfWork.TraderBot.update(bot);
			}));

			count += activeBots.bots.length;
		} while (activeBots.lastEvaluatedKey);

		return count;
	}

	public getTraderBotLogData = async (userId: string, botId: string): Promise<IBotTradeData> =>
		this.unitOfWork.TraderBotLogData.get(userId, botId)

	public saveTraderBotLogData = async (botLogData: IBotTradeData): Promise<IBotTradeData> =>
		this.unitOfWork.TraderBotLogData.create(botLogData)

	private validateBotStates = (states: string[]): void => {
		if (!states.length) throw Error('Bot state(s) missing');

		states.forEach((s: string) => {
			if (!(s in TradingBotState)) throw Error('Invalid bot state');
		});
	}

}
