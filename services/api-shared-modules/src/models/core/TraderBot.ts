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
	PAUSING = 'PAUSING',
	PAUSED = 'PAUSED',
	FINISHING = 'FINISHING',
	FINISHED = 'FINISHED',
	SHUTTING_DOWN = 'SHUTTING_DOWN',
	SHUT_DOWN = 'SHUT_DOWN'
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
		pausedAt?: Date | string;
		pauseConfirmedAt?: Date | string;
		updatedAt?: Date | string;
		stoppingAt?: Date | string; // Stop call is made to CRUD service
		stoppedAt?: Date | string; // Time bot stops running
		stopConfirmedAt?: Date | string; // Updated in CRUD service after bot stops
		shuttingDownAt?: Date | string; // Time the bot has been forced to shut down
		shutdownConfirmedAt?: Date | string; // Updated in CRUD service after bot shuts down
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
		pausedAt?: Date | string;
		pauseConfirmedAt?: Date | string;
		updatedAt?: Date | string;
		stoppingAt?: Date | string;
		stoppedAt?: Date | string;
		stopConfirmedAt?: Date | string;
		shuttingDownAt?: Date | string;
		shutdownConfirmedAt?: Date | string;
	};

}
