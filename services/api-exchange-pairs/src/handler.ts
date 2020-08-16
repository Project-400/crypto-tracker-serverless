import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ExchangeInfoController } from '../../api-exchange-info/src/exchange-info.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: ExchangeInfoController = new ExchangeInfoController(unitOfWork);

export const gatherAllExchangeInfo: ApiHandler = controller.gatherAllExchangeInfo;
export const getSymbolExchangeInfo: ApiHandler = controller.getSymbolExchangeInfo;
