import { Repository } from './Repository';
import { BotTradeDataItem } from '../../models/core/BotTradeData';
import { IBotTradeDataRepository } from '../interfaces';
import { ITraderBotLogData } from '@crypto-tracker/common-types';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class BotTradeDataRepository extends Repository implements IBotTradeDataRepository {

	public async createTradeBotData(data: ITraderBotLogData): Promise<ITraderBotLogData> {
		data.times.savedAt = new Date().toISOString();

		return this.db.put(Object.assign(new BotTradeDataItem(), {
			pk: `${Entity.TRADER_BOT_LOG_DATA}#${data.botId}`,
			sk: `${Entity.TRADER_BOT}#${data.botId}`,
			sk2: `${EntitySortType.CREATED_AT}#${data.times.createdAt}`,
			sk3: `${EntitySortType.SYMBOL}#${data.symbol}`,
			entity: Entity.TRADER_BOT_LOG_DATA,
			...data
		}));
	}

}
