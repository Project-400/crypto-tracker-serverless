import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { ValuationController } from './valuation.controller';
import { ValuationService } from './valuation.service';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';
import { CoinsService } from '../../api-coins/src/coins.service';
import { WalletValuationService } from './wallet-valuation.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const exchangeInfoService: ExchangeInfoService = new ExchangeInfoService(unitOfWork);
const coinsService: CoinsService = new CoinsService(unitOfWork);
const walletValuationService: WalletValuationService = new WalletValuationService(unitOfWork);
const valuationService: ValuationService = new ValuationService(exchangeInfoService);
const controller: ValuationController = new ValuationController(valuationService, coinsService, walletValuationService);

export const getValuation: ApiHandler = controller.getValuation;
export const getValuationForAllCoins: ApiHandler = controller.getValuationForAllCoins;
export const logWalletValue: ApiHandler = controller.logWalletValue;
