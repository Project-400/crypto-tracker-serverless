import { PriceChangeStats } from '../..';

export interface IPriceChangeStatsRepository {
	getAllPriceChangeStats(): Promise<PriceChangeStats[]>;
	savePriceChangeStatsBatch(pcs: PriceChangeStats): Promise<PriceChangeStats>;
}
