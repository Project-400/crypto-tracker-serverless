import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const transactionsService: TransactionsService = new TransactionsService(unitOfWork);
const controller: TransactionsController = new TransactionsController(transactionsService);

export const buyCurrency: ApiHandler = controller.buyCurrency;
export const sellCurrency: ApiHandler = controller.sellCurrency;
