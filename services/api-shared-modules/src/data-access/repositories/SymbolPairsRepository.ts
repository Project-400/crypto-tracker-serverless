import { Repository } from './Repository';
import { ISymbolPairsRepository } from '../interfaces';
import { Entity } from '../../types/entities';
import { SymbolPairs } from '@crypto-tracker/common-types';
import { SymbolPairsItem } from '../../models/core/SymbolPairs';

export class SymbolPairsRepository extends Repository implements ISymbolPairsRepository {

	public async get(): Promise<SymbolPairs> {
		return this.db.get(Object.assign(new SymbolPairsItem(), {
			pk: `${Entity.SYMBOL_PAIRS}#all`,
			sk: `${Entity.SYMBOL_PAIRS}#all`
		}));
	}

	public async create(symbolPairs: SymbolPairs): Promise<SymbolPairs> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new SymbolPairsItem(), {
			pk: `${Entity.SYMBOL_PAIRS}#all`,
			sk: `${Entity.SYMBOL_PAIRS}#all`,
			entity: Entity.SYMBOL_PAIRS,
			times: {
				createdAt: date,
				updatedAt: date
			},
			pairs: symbolPairs
		}));
	}

}
