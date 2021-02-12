import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ValuationController } from './valuation.controller';
import { ValuationService } from './valuation.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const valuationService: ValuationService = new ValuationService(unitOfWork);
const controller: ValuationController = new ValuationController(valuationService);

export const getValuation: ApiHandler = controller.getValuation;
