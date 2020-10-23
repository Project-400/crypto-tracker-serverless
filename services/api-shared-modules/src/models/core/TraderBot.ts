import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { DBItem } from '../../types';

export enum BotStopReason {
	USER_STOP = 'USER_STOP',
	CONNECTION_LOST = 'CONNECTION_LOST',
	UPDATES_STOPPED = 'UPDATES_STOPPED',
	SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
	BOT_ERROR = 'BOT_ERROR'
}

export enum BotType {
	SHORT_TERM = 'SHORT_TERM',
	LONG_TERM = 'LONG_TERM'
}

export enum TradingBotState { // Tenmporary until update NPM interface
	WAITING = 'WAITING',
	TRADING = 'TRADING',
	PAUSED = 'PAUSED',
	FINISHING = 'FINISHING',
	FINISHED = 'FINISHED'
}

export interface ITraderBot extends DBItem {
	botId: string;
	userId: string;
	botState: TradingBotState;
	botType: BotType;
	symbol?: string;
	tradeLimit?: number;
	stopReason?: BotStopReason;
	times: {
		createdAt: Date | string; // Created in CRUD service
		startedAt?: Date | string; // Starts operating in Bot service
		startConfirmedAt?: Date | string; // Updated in CRUD service after Bot service begins
		updatedAt?: Date | string;
		stoppingAt?: Date | string; // Stop call is made to CRUD service
		stoppedAt?: Date | string; // Time bot stops running
		stopConfirmedAt?: Date | string; // Updated in CRUD service after bot stops
	};
}

export class TraderBotItem extends DynamoDbItem implements ITraderBot {

	@attribute()
	public botId: string;

	@attribute()
	public userId: string;

	@attribute()
	public botState: TradingBotState;

	@attribute()
	public botType: BotType;

	@attribute()
	public symbol?: string;

	@attribute()
	public tradeLimit?: number;

	@attribute()
	public stopReason?: BotStopReason;

	@attribute()
	public times: {
		createdAt: Date | string;
		startedAt?: Date | string;
		startConfirmedAt?: Date | string;
		updatedAt?: Date | string;
		stoppingAt?: Date | string;
		stoppedAt?: Date | string;
		stopConfirmedAt?: Date | string;
	};

}
