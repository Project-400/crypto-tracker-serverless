import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const botsService: BotsService = new BotsService(unitOfWork);
const controller: BotsController = new BotsController(botsService);

export const getTraderBot: ApiHandler = controller.getTraderBot;
export const getAllTradingBots: ApiHandler = controller.getAllTradingBots;
export const getAllUserTradingBots: ApiHandler = controller.getAllUserTradingBots;
export const getAllTradingBotsByState: ApiHandler = controller.getAllTradingBotsByState;
export const getAllUserTradingBotsByState: ApiHandler = controller.getAllUserTradingBotsByState;
export const createTraderBot: ApiHandler = controller.createTraderBot;
export const stopTraderBot: ApiHandler = controller.stopTraderBot;
export const pauseTraderBot: ApiHandler = controller.pauseTraderBot;
export const shutDownAllTraderBots: ApiHandler = controller.shutDownAllTraderBots;
export const getTraderBotLogData: ApiHandler = controller.getTraderBotLogData;
export const saveTraderBotLogData: ApiHandler = controller.saveTraderBotLogData;
