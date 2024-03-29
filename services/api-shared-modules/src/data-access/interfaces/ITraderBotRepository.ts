import { ITraderBot } from '../../models/core/TraderBot';
import { LastEvaluatedKey } from '../../types';
import { BotsPageResponse } from '../repositories/TraderBotRepository';

export interface ITraderBotRepository {
	get(userId: string, botId: string, createdAt: string): Promise<ITraderBot>;
	getAll(lastEvaluatedKey?: LastEvaluatedKey, limit?: number): Promise<BotsPageResponse>;
	getAllByStates(states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number): Promise<BotsPageResponse>;
	getAllByUserAndStates(userId: string, states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number): Promise<BotsPageResponse>;
	create(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
	update(bot: ITraderBot): Promise<ITraderBot>;
}
