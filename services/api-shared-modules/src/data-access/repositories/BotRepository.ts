import { Repository } from './Repository';
import { BotTradeDataItem } from '../../models/core/BotTradeData';
import { IBotRepository } from '../interfaces';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class BotRepository extends Repository implements IBotRepository {

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
