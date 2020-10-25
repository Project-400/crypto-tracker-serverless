import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { PairPrice, PriceBatch } from '../../types';

export class PriceBatchItem extends DynamoDbItem implements PriceBatch {

	@attribute()
	public prices: PairPrice[];

	@attribute()
	public quote: string;

	@attribute()
	public times: {
		createdAt: string;
	};

}
