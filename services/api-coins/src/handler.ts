import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { ProfitsService } from './profits.service';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const coinsService: CoinsService = new CoinsService(unitOfWork);
const exchangeInfoService: ExchangeInfoService = new ExchangeInfoService(unitOfWork);
const profitsService: ProfitsService = new ProfitsService(unitOfWork, exchangeInfoService);
const controller: CoinsController = new CoinsController(coinsService, profitsService);

export const getAllCoins: ApiHandler = controller.getAllCoins;
export const getSpecifiedCoins: ApiHandler = controller.getSpecifiedCoins;
export const gatherUserCoins: ApiHandler = controller.gatherUserCoins;
export const getInvestmentChange: ApiHandler = controller.getInvestmentChange;
