import { IWalletValuationRepository } from '../interfaces/IWalletValuationRepository';
import { WalletValuationItem } from '../../models/core/WalletValuation';
import { WalletValuation, WalletValue } from '@crypto-tracker/common-types';
import { EntitySortType } from '../../types/entity-sort-types';
import { Repository } from './Repository';
import { Entity } from '../../types/entities';

export class WalletValuationRepository extends Repository implements IWalletValuationRepository {

	public async get(userId: string, roundedTime: string): Promise<WalletValuation> {
		try {
			return await this.db.get(Object.assign(new WalletValuationItem(), {
				pk: `${Entity.WALLET_VALUATION}#${roundedTime}`,
				sk: `${Entity.USER}#${userId}/${EntitySortType.TIME}#${roundedTime}`
			}));
		} catch (e) {
			return undefined;
		}
	}

	public async create(userId: string, roundedHour: string, roundedMinute: string, walletValue: WalletValue): Promise<WalletValuation> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${roundedHour}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.TIME}#${roundedHour}`,
			sk2: `${Entity.WALLET_VALUATION}#${roundedHour}`,
			entity: Entity.WALLET_VALUATION,
			times: {
				createdAt: date,
				valueStartingAt: roundedMinute
			},
			values: [ walletValue ]
		}));
	}

	public async update(roundedHour: string, userId: string, changes: Partial<WalletValuation>):
		Promise<WalletValuation> {
		delete changes.sk2;
		delete changes.sk3;

		changes.times.updatedAt = new Date().toISOString();

		return this.db.update(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${roundedHour}`,
			sk: `${Entity.USER}#${userId}/`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
