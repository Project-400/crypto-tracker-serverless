import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';

export interface IWalletValuationRepository {
	getOld(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<WalletValuation>;
	get(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<WalletValuation>;
	create(userId: string, walletValue: Partial<WalletValuation>): Promise<WalletValuation>;
	update(userId: string, changes: Partial<WalletValuation>): Promise<WalletValuation>;
}
