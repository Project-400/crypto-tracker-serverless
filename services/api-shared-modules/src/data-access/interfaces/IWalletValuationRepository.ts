import { VALUE_LOG_INTERVAL, WalletValue } from '@crypto-tracker/common-types';

export interface IWalletValuationRepository {
	get(userId: string, interval: VALUE_LOG_INTERVAL, roundedTime: string): Promise<WalletValue>;
	// getMinuteLog(userId: string, roundedMinute: string): Promise<WalletValuation>;
	// getRange(userId: string, startDate: string, endDate: string): Promise<WalletValuation[]>;
	create(userId: string, walletValue: Partial<WalletValue>): Promise<WalletValue>;
	// createMinuteLog(userId: string, roundedMinute: string, walletValue: WalletValue): Promise<WalletValue>;
	// update(roundedTime: string, userId: string, changes: Partial<WalletValue>): Promise<WalletValue>;
}
