import { IBotTradeData } from '@crypto-tracker/common-types';

export interface ITraderBotLogDataRepository {
	get(userId: string, botId: string): Promise<IBotTradeData>;
	create(data: IBotTradeData): Promise<IBotTradeData>;
}
