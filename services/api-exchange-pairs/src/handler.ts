import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ExchangePairsController } from './exchange-pairs.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: ExchangePairsController = new ExchangePairsController(unitOfWork);

export const gatherAllExchangePairs: ApiHandler = controller.gatherAllExchangePairs;
