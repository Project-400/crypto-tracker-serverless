import { Repository } from './Repository';
import { ITraderBotRepository } from '../interfaces';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';
import { ITraderBot, TraderBotItem } from '../../models/core/TraderBot';

export class TraderBotRepository extends Repository implements ITraderBotRepository {

	public async getTraderBot(userId: string, botId: string, createdAt: string): Promise<ITraderBot> {
		return this.db.get(Object.assign(new TraderBotItem(), {
			pk: this.pk(botId),
			sk: this.sk(userId, createdAt)
		}));
	}

	public async createBot(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot> {
		const botId: string = uuid();
		const date: string = new Date().toISOString();

		bot.times = {
			createdAt: date
		};

		return this.db.put(Object.assign(new TraderBotItem(), {
			pk: this.pk(botId),
			sk: this.sk(userId, date),
			sk2: this.sk2(date), // This can be replaced. Probably not needed to sort globally by createdAt
			sk3: this.sk3(bot.botType),
			entity: Entity.TRADER_BOT,
			botId,
			...bot
		}));
	}

	private pk = (botId: string): string => `${Entity.TRADER_BOT}#${botId}`;
	private sk = (userId: string, createdAt: string): string => `${Entity.USER}#${userId}/${EntitySortType.CREATED_AT}#${createdAt}`;
	private sk2 = (createdAt: string): string => `${EntitySortType.CREATED_AT}#${createdAt}`;
	private sk3 = (botType: string): string => `${EntitySortType.BOT_TYPE}#${botType}`;

}
