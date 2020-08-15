import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { TransactionsController } from './transactions.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: TransactionsController = new TransactionsController(unitOfWork);

export const buyCurrency: ApiHandler = controller.buyCurrency;
export const sellCurrency: ApiHandler = controller.sellCurrency;
