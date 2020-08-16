import { Transaction } from '../..';

export interface ITransactionRepository {
	save(transaction: Partial<Transaction>): Promise<Transaction>;
}
