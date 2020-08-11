import { PriceChangeStats } from '../..';

export interface IPriceChangeStatsRepository {
	getAllPriceChangeStats(): Promise<PriceChangeStats[]>;
	savePriceChangeStats(pcs: PriceChangeStats): Promise<PriceChangeStats>;
	update(statsId: string, changes: Partial<PriceChangeStats>): Promise<PriceChangeStats>;
}
