import { ExchangeInfo } from '../..';

export interface IExchangeInfoRepository {
	saveExchangeInfo(pair: Partial<ExchangeInfo>): Promise<ExchangeInfo>;
	getExchangeInfo(symbol: string, quote: string): Promise<ExchangeInfo>;
}
