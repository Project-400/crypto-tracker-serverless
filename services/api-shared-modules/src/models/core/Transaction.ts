import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Transaction, TransactionRequest, TransactionResponse } from '../../types';

export class TransactionItem extends DynamoDbItem implements Transaction {

	@attribute()
	public request: TransactionRequest;

	@attribute()
	public response: TransactionResponse;

	@attribute()
	public symbol: string;

	@attribute()
	public base: string;

	@attribute()
	public quote: string;

	@attribute()
	public completed: boolean;

	@attribute()
	public times: {
		createdAt: Date | string;
	};

}
