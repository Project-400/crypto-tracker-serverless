import { Repository } from './Repository';
import { IExchangeInfoRepository } from '../interfaces';
import { ExchangeInfoSymbolItem } from '../../models/core/ExchangeInfo';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { Entity } from '../../types/entities';

export class ExchangeInfoRepository extends Repository implements IExchangeInfoRepository {

	public async getExchangeInfo(symbol: string, quote: string): Promise<ExchangeInfoSymbol> {
		return this.db.get(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `${Entity.EXCHANGE_INFO}#${symbol}`,
			sk: `${Entity.EXCHANGE_INFO}#${quote}`
		}));
	}

	public async saveExchangeInfo(pair: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `${Entity.EXCHANGE_INFO}#${pair.symbol}`,
			sk: `${Entity.EXCHANGE_INFO}#${pair.quoteAsset}`,
			entity: Entity.EXCHANGE_INFO,
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pair
		}));
	}

}
