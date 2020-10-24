import { ITraderBot } from '../../models/core/TraderBot';
import { LastEvaluatedKey } from '../../types';
import { BotsPageResponse } from '../repositories/TraderBotRepository';

export interface ITraderBotRepository {
	get(userId: string, botId: string, createdAt: string): Promise<ITraderBot>;
	getAll(): Promise<ITraderBot[]>;
	getAllByStates(states: string[], lastEvaluatedKey?: LastEvaluatedKey, limit?: number): Promise<BotsPageResponse>;
	getAllByUserAndStates(userId: string, states: string[]): Promise<ITraderBot[]>;
	create(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot>;
	update(userId: string, bot: ITraderBot): Promise<ITraderBot>;
}
