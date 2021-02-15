import { WalletValuation } from '@crypto-tracker/common-types';

export interface IWalletValuationRepository {
	create(userId: string, value: string): Promise<WalletValuation>;
	update(walletValuationId: string, userId: string, value: string, changes: Partial<WalletValuation>): Promise<WalletValuation>;
}
