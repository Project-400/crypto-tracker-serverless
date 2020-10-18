import { Transaction } from '../../types';
import { Repository } from './Repository';
import { ITransactionRepository } from '../interfaces';
import { TransactionItem } from '../../models/core/Transaction';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';

export class TransactionRepository extends Repository implements ITransactionRepository {

	public async save(userId: string, transaction: Partial<Transaction>): Promise<Transaction> {
		const date: string = new Date().toISOString();
		const transactionId: string = uuid();

		return this.db.put(Object.assign(new TransactionItem(), {
			pk: `${Entity.TRANSACTION}#${transactionId}`,
			sk: `${Entity.USER}#${userId}/${EntitySortType.CREATED_AT}#${date}`,
			sk2: `${transaction.request.side === 'BUY' ? 'buy' : 'sell'}#${EntitySortType.CREATED_AT}#${date}`,
			sk3: `${transaction.request.side === 'BUY' ? 'buy' : 'sell'}#${transaction.completed ? 'completed' : 'failed'}#${EntitySortType.CREATED_AT}#${date}`,
			entity: Entity.TRANSACTION,
			times: {
				createdAt: date
			},
			...transaction
		}));
	}

}
