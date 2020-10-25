import { Repository } from './Repository';
import { TraderBotLogDataItem } from '../../models/core/BotTradeData';
import { ITraderBotLogDataRepository } from '../interfaces';
import { ITraderBotLogData } from '@crypto-tracker/common-types';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class TraderBotLogDataRepository extends Repository implements ITraderBotLogDataRepository {

	public async get(userId: string, botId: string): Promise<ITraderBotLogData> {
		return this.db.get(Object.assign(new TraderBotLogDataItem(), {
			pk: this.pk(botId),
			sk: this.sk(botId)
		}));
	}

	public async create(data: ITraderBotLogData): Promise<ITraderBotLogData> {
		data.times.savedAt = new Date().toISOString();

		return this.db.put(Object.assign(new TraderBotLogDataItem(), {
			pk: this.pk(data.bot.botId),
			sk: this.sk(data.bot.botId),
			sk2: this.sk2(data.times.createdAt.toString()),
			sk3: this.sk3(data.symbol),
			entity: Entity.TRADER_BOT_LOG_DATA,
			...data
		}));
	}

	private pk = (botId: string): string => `${Entity.TRADER_BOT_LOG_DATA}#${botId}`;
	private sk = (botId: string): string => `${Entity.TRADER_BOT}#${botId}`;
	private sk2 = (createdAt: string): string => `${EntitySortType.CREATED_AT}#${createdAt}`;
	private sk3 = (symbol: string): string => `${EntitySortType.SYMBOL}#${symbol}`;

}
