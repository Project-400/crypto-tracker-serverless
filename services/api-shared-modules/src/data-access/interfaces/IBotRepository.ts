import { ISymbolTraderData } from '@crypto-tracker/common-types';

export interface IBotRepository {
	saveTradeBotData(data: ISymbolTraderData): Promise<ISymbolTraderData>;
}
