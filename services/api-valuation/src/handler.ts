import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ValuationController } from './valuation.controller';
import { ValuationService } from './valuation.service';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const exchangeInfoService: ExchangeInfoService = new ExchangeInfoService(unitOfWork);
const valuationService: ValuationService = new ValuationService(unitOfWork, exchangeInfoService);
const controller: ValuationController = new ValuationController(valuationService);

export const getValuation: ApiHandler = controller.getValuation;
