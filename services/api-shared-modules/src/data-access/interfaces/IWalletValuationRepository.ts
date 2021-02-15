import { WalletValuation } from '@crypto-tracker/common-types';

export interface IWalletValuationRepository {
	create(userId: string, value: string): Promise<WalletValuation>;
	update(userId: string, value: string): Promise<WalletValuation>;
}
