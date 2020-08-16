import { ExchangePair } from '../..';

export interface IExchangePairRepository {
	saveExchangePair(pair: Partial<ExchangePair>): Promise<ExchangePair>;
	getAllPairs(): Promise<ExchangePair[]>;
	getExchangePair(symbol: string, quote: string): Promise<ExchangePair>;
}
