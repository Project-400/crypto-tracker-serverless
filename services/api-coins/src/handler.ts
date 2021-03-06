import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { ProfitsService } from './profits.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const coinsService: CoinsService = new CoinsService(unitOfWork);
const profitsService: ProfitsService = new ProfitsService(unitOfWork);
const controller: CoinsController = new CoinsController(coinsService, profitsService);

export const getAllCoins: ApiHandler = controller.getAllCoins;
export const getSpecifiedCoins: ApiHandler = controller.getSpecifiedCoins;
export const gatherUserCoins: ApiHandler = controller.gatherUserCoins;
export const getInvestmentChange: ApiHandler = controller.getInvestmentChange;
