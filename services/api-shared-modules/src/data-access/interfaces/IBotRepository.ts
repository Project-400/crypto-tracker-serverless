import { ISymbolTraderData } from '@crypto-tracker/common-types';
import { ITraderBot } from '../../models/core/TraderBot';

export interface IBotRepository {
	createBot(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
	saveTradeBotData(data: ISymbolTraderData): Promise<ISymbolTraderData>;
}
