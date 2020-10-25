import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { BotType, ITraderBot, TradingBotState } from '../../api-shared-modules/src/models/core/TraderBot';
import { BotsPageResponse } from '../../api-shared-modules/src/data-access/repositories/TraderBotRepository';
import { LastEvaluatedKey } from '../../api-shared-modules/src/types';
import { GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { ITraderBotLogData } from '@crypto-tracker/common-types';

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

	public getAllTradingBotsByState = async (states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number):
		Promise<BotsPageResponse> => {
		this.validateBotStates(states);

		return this.unitOfWork.TraderBot.getAllByStates(states, lastEvaluatedKey, limit);
	}

	public createTraderBot = async (userId: string, symbol: string): Promise<ITraderBot> => {
		const bot: Partial<ITraderBot> = {
			userId,
			symbol,
			botType: BotType.SHORT_TERM,
			botState: TradingBotState.WAITING
		};

		const priceData: GetSymbolPriceDto = await BinanceApi.GetSymbolPrice(symbol); // Using price endpoint as alternative
		if (priceData.code !== undefined || priceData.msg === 'Invalid symbol.') throw Error('Cryptocurrency symbol not found');

		// TODO: Implement call to bot service
		// Possibly let this endpoint return & notify bot startup via Websocket

		return this.unitOfWork.TraderBot.create(userId, bot);
	}

	public stopTraderBot = async (userId: string, botId: string, createdAt: string): Promise<ITraderBot> => {
		const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

		bot.botState = TradingBotState.FINISHING;
		bot.times.stoppingAt = new Date().toISOString();

		const finishingResult: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

		console.log(finishingResult.botId); // Pass into bot service
		// TODO: Implement call to bot service

		bot.botState = TradingBotState.FINISHED;
		bot.times.startConfirmedAt = new Date().toISOString();

		return this.unitOfWork.TraderBot.update(userId, bot);
	}

	public pauseTraderBot = async (userId: string, botId: string, createdAt: string): Promise<ITraderBot> => {
		const bot: ITraderBot = await this.unitOfWork.TraderBot.get(userId, botId, createdAt);

		bot.botState = TradingBotState.PAUSING;
		bot.times.pausedAt = new Date().toISOString();

		const finishingResult: ITraderBot = await this.unitOfWork.TraderBot.update(userId, bot);

		console.log(finishingResult.botId); // Pass into bot service
		// TODO: Implement call to bot service

		bot.botState = TradingBotState.PAUSED;
		bot.times.pauseConfirmedAt = new Date().toISOString();

		return this.unitOfWork.TraderBot.update(userId, bot);
	}

	public shutDownAllTraderBots = async (userId: string): Promise<number> => {
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

		return count;
	}

	public getTraderBotLogData = async (userId: string, botId: string): Promise<ITraderBotLogData> =>
		this.unitOfWork.TraderBotLogData.get(userId, botId)

	public saveTraderBotLogData = async (botLogData: ITraderBotLogData): Promise<ITraderBotLogData> =>
		this.unitOfWork.TraderBotLogData.create(botLogData)

	private validateBotStates = (states: string[]): void => {
		if (!states.length) throw Error('Bot state(s) missing');

		states.forEach((s: string) => {
			if (!(s in TradingBotState)) throw Error('Invalid bot state');
		});
	}

}
