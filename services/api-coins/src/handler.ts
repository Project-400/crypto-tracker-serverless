import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { CoinsController } from './coins.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: CoinsController = new CoinsController(unitOfWork);

export const getCoins: ApiHandler = controller.getCoins;
export const gatherUserCoins: ApiHandler = controller.gatherUserCoins;
