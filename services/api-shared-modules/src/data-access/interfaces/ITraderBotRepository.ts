import { ITraderBot } from '../../models/core/TraderBot';

export interface ITraderBotRepository {
	get(userId: string, botId: string, createdAt: string): Promise<ITraderBot>;
	create(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
	update(userId: string, bot: ITraderBot): Promise<ITraderBot>;
}