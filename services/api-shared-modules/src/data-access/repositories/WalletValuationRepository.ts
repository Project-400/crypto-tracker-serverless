import { IWalletValuationRepository } from '../interfaces';
import { WalletValuationItem, OldWalletValuationItem } from '../../models/core/WalletValuation';
import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import { EntitySortType } from '../../types/entity-sort-types';
import { Repository } from './Repository';
import { Entity } from '../../types/entities';

export class WalletValuationRepository extends Repository implements IWalletValuationRepository {

	public async getOld(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<any> {
		try {
			return await this.db.get(Object.assign(new OldWalletValuationItem(), {
				pk: `${Entity.WALLET_VALUATION}#${roundedTime}`,
				sk: `${Entity.USER}#${userId}/${EntitySortType.TIME}#${roundedTime}`
			}));
		} catch (e) {
			return undefined;
		}
	}

	public async get(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<WalletValuation> {
		try {
			return await this.db.get(Object.assign(new WalletValuationItem(), {
				pk: `${Entity.WALLET_VALUATION}#${roundedTime}`,
				sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${interval}/${EntitySortType.TIME}#${roundedTime}`
			}));
		} catch (e) {
			return undefined;
		}
	}

	public async create(userId: string, walletValue: Partial<WalletValuation>): Promise<WalletValuation> {
		const date: string = new Date().toISOString();

		console.log(`Creating WalletValuation: ** pk: ${Entity.WALLET_VALUATION}#${walletValue.time} ** sk: ${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${walletValue.interval}/${EntitySortType.TIME}#${walletValue.time}`);

		return this.db.put(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${walletValue.time}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.INTERVAL}#${walletValue.interval}/${EntitySortType.TIME}#${walletValue.time}`,
			sk2: `${Entity.WALLET_VALUATION}#${walletValue.time}`,
			entity: Entity.WALLET_VALUATION,
			times: {
				createdAt: date
			},
			...walletValue
		}));
	}

	public async update(userId: string, changes: Partial<WalletValuation>): Promise<WalletValuation> {
		delete changes.sk2;
		delete changes.sk3;

		changes.times.updatedAt = new Date().toISOString();

		return this.db.update(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${changes.time}`,
			sk: `${Entity.USER}#${userId}/`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
