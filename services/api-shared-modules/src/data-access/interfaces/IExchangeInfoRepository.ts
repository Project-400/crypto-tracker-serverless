import { ExchangeInfoSymbol } from '../..';

export interface IExchangeInfoRepository {
	saveExchangeInfo(pair: Partial<ExchangeInfoSymbol>): Promise<ExchangeInfoSymbol>;
	getExchangeInfo(symbol: string, quote: string): Promise<ExchangeInfoSymbol>;
}
