import { ITraderBot } from '../../models/core/TraderBot';

export interface ITraderBotRepository {
	getTraderBot(userId: string, botId: string, createdAt: string): Promise<ITraderBot>;
	createBot(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
}
