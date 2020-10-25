import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ExchangeInfoController } from './exchange-info.controller';
import { ExchangeInfoService } from './exchange-info.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const exchangeInfoService: ExchangeInfoService = new ExchangeInfoService(unitOfWork);
const controller: ExchangeInfoController = new ExchangeInfoController(exchangeInfoService);

export const gatherAllExchangeInfo: ApiHandler = controller.gatherAllExchangeInfo;
export const getSymbolExchangeInfo: ApiHandler = controller.getSymbolExchangeInfo;
