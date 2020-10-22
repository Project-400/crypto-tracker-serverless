import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { BotsController } from './bots.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: BotsController = new BotsController(unitOfWork);

export const createTraderBot: ApiHandler = controller.createTraderBot;
export const getTraderBot: ApiHandler = controller.getTraderBot;
export const saveTradeBotData: ApiHandler = controller.saveTradeBotData;
export const testPublish: ApiHandler = controller.testPublish;
