import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TrendsController } from './trends.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: TrendsController = new TrendsController(unitOfWork);

export const logNewPriceBatch: ApiHandler = controller.logNewPriceBatch;
export const savePriceChangeStats: ApiHandler = controller.savePriceChangeStats;
export const getBestPerformers: ApiHandler = controller.getBestPerformers;
export const getBestPerformersByQuote: ApiHandler = controller.getBestPerformersByQuoteCurrency;
export const getPriceChangeStatsByBase: ApiHandler = controller.getPriceChangeStatsByBaseCurrency;
