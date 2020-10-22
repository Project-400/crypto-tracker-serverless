import { ISymbolTraderData } from '@crypto-tracker/common-types';

export interface IBotTradeDataRepository {
	createTradeBotData(data: ISymbolTraderData): Promise<ISymbolTraderData>;
}
