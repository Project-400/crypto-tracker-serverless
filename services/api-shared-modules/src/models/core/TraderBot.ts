import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { TradingBotState } from '@crypto-tracker/common-types';

enum BotStopReason {
	USER_STOP = 'USER_STOP',
	CONNECTION_LOST = 'CONNECTION_LOST',
	UPDATES_STOPPED = 'UPDATES_STOPPED',
	SYSTEM_SHUTDOWN = 'SYSTEM_SHUTDOWN',
	BOT_ERROR = 'BOT_ERROR'
}

export interface ITraderBot {
	botId: string;
	userId: string;
	botState: TradingBotState;
	symbol?: string;
	tradeLimit?: number;
	stopReason?: BotStopReason;
	times: {
		createdAt: Date | string; // Created in CRUD service
		startedAt?: Date | string; // Starts operating in Bot service
		confirmedAt?: Date | string; // Updated in CRUD service after Bot service begins
		updatedAt?: Date | string;
		stoppedAt?: Date | string;
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
	public symbol?: string;

	@attribute()
	public tradeLimit?: number;

	@attribute()
	public stopReason?: BotStopReason;

	@attribute()
	public times: {
		createdAt: Date | string;
		startedAt?: Date | string;
		confirmedAt?: Date | string;
		updatedAt?: Date | string;
		stoppedAt?: Date | string;
	};

}
