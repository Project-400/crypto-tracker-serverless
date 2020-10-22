import { Repository } from './Repository';
import { ITraderBotRepository } from '../interfaces';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';
import { ITraderBot, TraderBotItem } from '../../models/core/TraderBot';

export class TraderBotRepository extends Repository implements ITraderBotRepository {

	public async createBot(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot> {
		const botId: string = uuid();
		const date: string = new Date().toISOString();

		bot.times.createdAt = date;

		return this.db.put(Object.assign(new TraderBotItem(), {
			pk: `${Entity.TRADER_BOT}#${botId}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.CREATED_AT}#${date}`,
			sk2: `${EntitySortType.CREATED_AT}#${date}`, // This can be replaced. Probably not needed to sort globally by createdAt
			sk3: `${EntitySortType.BOT_TYPE}#${bot.botType}`,
			entity: Entity.TRADER_BOT,
			...bot
		}));
	}

}
