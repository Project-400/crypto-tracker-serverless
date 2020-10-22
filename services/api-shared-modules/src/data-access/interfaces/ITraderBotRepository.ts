import { ITraderBot } from '../../models/core/TraderBot';

export interface ITraderBotRepository {
	createBot(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
}
