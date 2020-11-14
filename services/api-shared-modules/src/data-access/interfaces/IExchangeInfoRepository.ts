import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

export interface IExchangeInfoRepository {
	get(symbol: string): Promise<ExchangeInfoSymbol>;
	create(pair: Partial<ExchangeInfoSymbol>): Promise<ExchangeInfoSymbol>;
	update(pair: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol>;
}
