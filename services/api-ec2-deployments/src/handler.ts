import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { Ec2DeploymentsController } from './ec2-deployments.controller';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { ExchangeInfoService } from '../../api-exchange-info/src/exchange-info.service';
import { CoinsService } from '../../api-coins/src/coins.service';
import { WalletValuationService } from './wallet-valuation.service';
import { DatetimeUtils } from '../../api-shared-modules/src/utils/datetime';

const unitOfWork: UnitOfWork = new UnitOfWork();
const exchangeInfoService: ExchangeInfoService = new ExchangeInfoService(unitOfWork);
const coinsService: CoinsService = new CoinsService(unitOfWork);
const datetimeUtils: DatetimeUtils = new DatetimeUtils();
const walletValuationService: WalletValuationService = new WalletValuationService(unitOfWork, datetimeUtils);
const valuationService: Ec2DeploymentsService = new Ec2DeploymentsService(exchangeInfoService);
const controller: Ec2DeploymentsController = new Ec2DeploymentsController(valuationService, coinsService, walletValuationService);

export const retrieveValuationLog: ApiHandler = controller.retrieveValuationLog;
