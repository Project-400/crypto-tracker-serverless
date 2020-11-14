import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

export interface IExchangeInfoRepository {
	get(symbol: string): Promise<ExchangeInfoSymbol>;
	create(info: Partial<ExchangeInfoSymbol>): Promise<ExchangeInfoSymbol>;
	update(info: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol>;
}
