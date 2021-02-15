import { IWalletValuationRepository } from '../interfaces/IWalletValuationRepository';
import { WalletValuationItem } from '../../models/core/WalletValuation';
import { v4 as uuid } from 'uuid';
import { WalletValuation, WalletValue } from '@crypto-tracker/common-types';

export class WalletValuationRepository extends Repository implements IWalletValuationRepository {

	public async create(userId: string, value: string): Promise<WalletValuation> {
		const walletValuationId: string = uuid();
		const millis: number = 1000 * 60;
		const date: Date = new Date();
		const dateISO: string = date.toISOString();
		const roundedTime: string = new Date(Math.ceil(date.getTime() / millis) * millis).toISOString();
		const walletValue: WalletValue = {
			value,
			time: roundedTime
		};

		return this.db.put(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${walletValuationId}`,
			sk: `${Entity.USER}#${userId}/`,
			sk2: `${Entity.WALLET_VALUATION}#${roundedTime}`,
			entity: Entity.WALLET_VALUATION,
			times: {
				createdAt: dateISO,
				valueStartingAt: roundedTime
			},
			values: [ walletValue ]
		}));
	}

	public async update(walletValuationId: string, userId: string, value: string, changes: Partial<WalletValuation>):
		Promise<WalletValuation> {
		delete changes.sk2;
		delete changes.sk3;

		return this.db.update(Object.assign(new WalletValuationItem(), {
			pk: `${Entity.WALLET_VALUATION}#${walletValuationId}`,
			sk: `${Entity.USER}#${userId}/`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

}
