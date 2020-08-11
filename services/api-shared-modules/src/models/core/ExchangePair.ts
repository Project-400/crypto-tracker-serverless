import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ExchangePair } from '../../types';

export class ExchangePairItem extends DynamoDbItem implements ExchangePair {

	@attribute()
	public symbol: string;

	@attribute()
	public base: string;

	@attribute()
	public quote: string;

	@attribute()
	public times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};

}
