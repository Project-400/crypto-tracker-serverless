import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const coinsService: CoinsService = new CoinsService(unitOfWork);
const controller: CoinsController = new CoinsController(coinsService);

export const getCoins: ApiHandler = controller.getCoins;
export const gatherUserCoins: ApiHandler = controller.gatherUserCoins;
export const getInvestmentChange: ApiHandler = controller.getInvestmentChange;
