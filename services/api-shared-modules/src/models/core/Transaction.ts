import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Transaction, TransactionRequest } from '../../types';
import { ExchangeCurrencyTransactionFull } from '@crypto-tracker/common-types';

export class TransactionItem extends DynamoDbItem implements Transaction {

	@attribute()
	public request: TransactionRequest;

	@attribute()
	public response: ExchangeCurrencyTransactionFull;

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
		createdAt: string;
	};

}
