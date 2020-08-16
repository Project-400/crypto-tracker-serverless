import { Repository } from './Repository';
import { IExchangeInfoRepository } from '../interfaces';
import { ExchangeInfoSymbolItem } from '../../models/core/ExchangeInfo';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';

export class ExchangeInfoRepository extends Repository implements IExchangeInfoRepository {

	public async getExchangeInfo(symbol: string, quote: string): Promise<ExchangeInfoSymbol> {
		return this.db.get(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `exchangeInfo#${symbol}`,
			sk: `exchangeInfo#${quote}`
		}));
	}

	public async saveExchangeInfo(pair: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `exchangeInfo#${pair.symbol}`,
			sk: `exchangeInfo#${pair.quoteAsset}`,
			entity: 'exchangeInfo',
			times: {
				createdAt: date,
				updatedAt: date
			},
			...pair
		}));
	}

}
