import { WalletValuation, WalletValue } from '@crypto-tracker/common-types';

export interface IWalletValuationRepository {
	get(userId: string, roundedTime: string): Promise<WalletValuation>;
	create(userId: string, roundedHour: string, roundedMinute: string, walletValue: WalletValue): Promise<WalletValuation>;
	update(roundedTime: string, userId: string, changes: Partial<WalletValuation>): Promise<WalletValuation>;
}
