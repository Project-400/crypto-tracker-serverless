import { Repository } from './Repository';
import { BotTradeDataItem } from '../../models/core/BotTradeData';
import { IBotRepository } from '../interfaces';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
import { v4 as uuid } from 'uuid';

export class BotRepository extends Repository implements IBotRepository {

	public async saveTradeBotData(data: ISymbolTraderData): Promise<ISymbolTraderData> {
		const id: string = uuid();
		const date: string = new Date().toISOString();

		data.times.savedAt = date;

		return this.db.put(Object.assign(new BotTradeDataItem(), {
			pk: `botTradeData#${id}`,
			sk: `botTradeData#${id}`,
			sk2: `createdAt#${date}`,
			sk3: `symbol#${data.symbol}`,
			entity: 'botTradeData',
			...data
		}));
	}

}
