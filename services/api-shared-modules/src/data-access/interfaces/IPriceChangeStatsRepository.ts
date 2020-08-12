import { PriceChangeStats } from '../..';

export interface IPriceChangeStatsRepository {
	getAllPriceChangeStats(): Promise<PriceChangeStats[]>;
	getPriceChangeStatsByQuote(quote: string): Promise<PriceChangeStats[]>;
	getPriceChangeStatsByBase(base: string): Promise<PriceChangeStats[]>;
	savePriceChangeStats(pcs: PriceChangeStats): Promise<PriceChangeStats>;
	update(statsId: string, changes: Partial<PriceChangeStats>): Promise<PriceChangeStats>;
}
