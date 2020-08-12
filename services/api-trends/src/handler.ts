import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TrendsController } from './trends.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: TrendsController = new TrendsController(unitOfWork);

export const logNewPriceBatch: ApiHandler = controller.logNewPriceBatch;
export const savePriceChangeStats: ApiHandler = controller.savePriceChangeStats;
export const getBestPerformers: ApiHandler = controller.getBestPerformers;
export const getBestPerformersByQuoteCurrency: ApiHandler = controller.getBestPerformersByQuoteCurrency;
export const getPriceChangeStatsByBaseCurrency: ApiHandler = controller.getPriceChangeStatsByBaseCurrency;
