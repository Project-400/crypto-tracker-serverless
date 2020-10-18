import { Transaction } from '../..';

export interface ITransactionRepository {
	save(userId: string, transaction: Partial<Transaction>): Promise<Transaction>;
}
