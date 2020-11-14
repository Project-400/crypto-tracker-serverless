import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

export interface IExchangeInfoRepository {
	saveExchangeInfo(pair: Partial<ExchangeInfoSymbol>): Promise<ExchangeInfoSymbol>;
	getExchangeInfo(symbol: string): Promise<ExchangeInfoSymbol>;
}
