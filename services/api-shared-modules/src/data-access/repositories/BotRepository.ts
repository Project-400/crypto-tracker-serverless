import { Repository } from './Repository';
import { BotTradeDataItem } from '../../models/core/BotTradeData';
import { IBotRepository } from '../interfaces';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';
import { ITraderBot, TraderBotItem } from '../../models/core/TraderBot';

export class BotRepository extends Repository implements IBotRepository {

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

	public async saveTradeBotData(data: ISymbolTraderData): Promise<ISymbolTraderData> {
		const id: string = uuid();
		const date: string = new Date().toISOString();

		data.times.savedAt = date;

		return this.db.put(Object.assign(new BotTradeDataItem(), {
			pk: `${Entity.BOT_TRADE_DATA}#${id}`,
			sk: `${Entity.BOT_TRADE_DATA}#${id}`,
			sk2: `${EntitySortType.CREATED_AT}#${date}`,
			sk3: `${EntitySortType.SYMBOL}#${data.symbol}`,
			entity: Entity.BOT_TRADE_DATA,
			...data
		}));
	}

}
