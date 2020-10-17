import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { BinanceExchangeFilter, BinanceRateLimitType } from '../binance.enums';

export interface GetExchangeInfoDto {
	timezone: string;
	serverTime: number;
	rateLimits: BinanceRateLimitType[];
	exchangeFilters: BinanceExchangeFilter[];
	symbols: ExchangeInfoSymbol[];
}
