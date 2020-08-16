import { Transaction } from '../../types';
import { Repository } from './Repository';
import { ITransactionRepository } from '../interfaces';
import { TransactionItem } from '../../models/core/Transaction';
import { v4 as uuid } from 'uuid';

export class TransactionRepository extends Repository implements ITransactionRepository {

	public async save(transaction: Partial<Transaction>): Promise<Transaction> {
		const date: string = new Date().toISOString();
		const transactionId: string = uuid();

		return this.db.put(Object.assign(new TransactionItem(), {
			pk: `transaction#${transactionId}`,
			sk: `createdAt#${date}`,
			sk2: `${transaction.request.side === 'BUY' ? 'buy' : 'sell'}#createdAt#${date}`,
			sk3: `${transaction.request.side === 'BUY' ? 'buy' : 'sell'}#${transaction.completed ? 'completed' : 'failed'}#createdAt#${date}`,
			entity: 'transaction',
			times: {
				createdAt: date
			},
			...transaction
		}));
	}

}
