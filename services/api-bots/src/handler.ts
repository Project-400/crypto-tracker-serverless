import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { BotsController } from './bots.controller';

const unitOfWork: UnitOfWork = new UnitOfWork();
const controller: BotsController = new BotsController(unitOfWork);

export const getTraderBot: ApiHandler = controller.getTraderBot;
export const getAllTradingBots: ApiHandler = controller.getAllTradingBots;
export const getAllTradingBotsByState: ApiHandler = controller.getAllTradingBotsByState;
export const getAllUserTradingBotsByState: ApiHandler = controller.getAllUserTradingBotsByState;
export const createTraderBot: ApiHandler = controller.createTraderBot;
export const stopTraderBot: ApiHandler = controller.stopTraderBot;
export const pauseTraderBot: ApiHandler = controller.pauseTraderBot;
export const shutDownAllTraderBots: ApiHandler = controller.shutDownAllTraderBots;
export const saveTradeBotData: ApiHandler = controller.saveTradeBotData;
