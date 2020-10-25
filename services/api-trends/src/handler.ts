import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const trendsService: TrendsService = new TrendsService(unitOfWork);
const controller: TrendsController = new TrendsController(trendsService);

export const logNewPriceBatch: ApiHandler = controller.logNewPriceBatch;
export const savePriceChangeStats: ApiHandler = controller.savePriceChangeStats;
export const getBestPerformers: ApiHandler = controller.getBestPerformers;
export const getBestPerformersByQuote: ApiHandler = controller.getBestPerformersByQuoteCurrency;
export const getPriceChangeStatsByBase: ApiHandler = controller.getPriceChangeStatsByBaseCurrency;
