import { ExchangePair } from '../..';

export interface IExchangePairRepository {
	saveExchangePair(pair: ExchangePair): Promise<ExchangePair>;
	getAllPairs(): Promise<ExchangePair[]>;
}
