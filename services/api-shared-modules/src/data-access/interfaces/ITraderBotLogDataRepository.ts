import { ITraderBotLogData } from '@crypto-tracker/common-types';

export interface ITraderBotLogDataRepository {
	get(userId: string, botId: string): Promise<ITraderBotLogData>;
	create(data: ITraderBotLogData): Promise<ITraderBotLogData>;
}
