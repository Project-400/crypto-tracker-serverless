import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ExchangePairsController } from './exchange-pairs.controller';
import { ExchangePairsService } from './exchange-pairs.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const exchangePairsService: ExchangePairsService = new ExchangePairsService(unitOfWork);
const controller: ExchangePairsController = new ExchangePairsController(exchangePairsService);

export const gatherAllExchangePairs: ApiHandler = controller.gatherAllExchangePairs;
export const getSymbolExchangePair: ApiHandler = controller.getSymbolExchangePair;
export const updatePairsBySymbols: ApiHandler = controller.updatePairsBySymbols;
export const getPairsBySymbols: ApiHandler = controller.getPairsBySymbols;
