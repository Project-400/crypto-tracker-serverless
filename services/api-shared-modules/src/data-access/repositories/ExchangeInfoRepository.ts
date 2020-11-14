import { Repository } from './Repository';
import { IExchangeInfoRepository } from '../interfaces';
import { ExchangeInfoSymbolItem } from '../../models/core/ExchangeInfo';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class ExchangeInfoRepository extends Repository implements IExchangeInfoRepository {

	public async get(symbol: string): Promise<ExchangeInfoSymbol> {
		return this.db.get(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `${Entity.EXCHANGE_INFO}#${symbol}`,
			sk: `${Entity.EXCHANGE_INFO}#${symbol}`
		}));
	}

	public async create(info: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: `${Entity.EXCHANGE_INFO}#${info.symbol}`,
			sk: `${Entity.EXCHANGE_INFO}#${info.symbol}`,
			sk2: `${EntitySortType.QUOTE}#${info.quoteAsset}`,
			sk3: `${EntitySortType.BASE}#${info.baseAsset}`,
			entity: Entity.EXCHANGE_INFO,
			times: {
				createdAt: date,
				updatedAt: date
			},
			...info
		}));
	}

	public async update(info: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol> {
		delete info.sk2;
		delete info.sk3;

		info.times.updatedAt = new Date().toISOString();

		return this.db.update(Object.assign(new ExchangeInfoSymbolItem(), {
			pk: info.pk,
			sk: info.sk,
			...info
		}), {
			onMissing: 'skip'
		});
	}

}
