import { ApiHandler } from '../../api-shared-modules/src';
import { CoinsController } from './coins.controller';

const controller: CoinsController = new CoinsController();

export const getCoins: ApiHandler = controller.getCoins;
