import { IWalletValuationRepository } from '../interfaces';
import { WalletValuationItem } from '../../models/core/WalletValuation';
import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import { EntitySortType } from '../../types/entity-sort-types';
import { Repository } from './Repository';
import { Entity } from '../../types/entities';

export class WalletValuationRepository extends Repository implements IWalletValuationRepository {

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

	// public async getRange(userId: string, startDate: string, endDate: string): Promise<WalletValuation[]> {
	// 	const logs: WalletValuation[] = [];
	//
	// 	try {
	// 		return logs;
	// 	} catch (e) {
	// 		return undefined;
	// 	}
	// }

	// public async getMinuteLog(userId: string, roundedMinute: string): Promise<WalletValue> {
	// 	await console.log(this);
	// 	throw new Error('Method not implemented');
	// }
	//
	// public async createMinuteLog(userId: string, roundedMinute: string, walletValue: WalletValue): Promise<WalletValue> {
	// 	await console.log(this);
	// 	throw new Error('Method not implemented');
	// }

	// public async create(userId: string, roundedHour: string, roundedMinute: string, walletValue: WalletValue): Promise<WalletValuation> {
	// 	const date: string = new Date().toISOString();
	//
	// 	return this.db.put(Object.assign(new WalletValuationItem(), {
	// 		pk: `${Entity.WALLET_VALUATION}#${roundedHour}`,
	// 		sk: `${Entity.USER}#${userId}/${EntitySortType.TIME}#${roundedHour}`,
	// 		sk2: `${Entity.WALLET_VALUATION}#${roundedHour}`,
	// 		entity: Entity.WALLET_VALUATION,
	// 		times: {
	// 			createdAt: date,
	// 			valueStartingAt: roundedMinute
	// 		},
	// 		values: [ walletValue ]
	// 	}));
	// }

	public async create(userId: string, walletValue: Partial<WalletValuation>): Promise<WalletValuation> {
		const date: string = new Date().toISOString();

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
