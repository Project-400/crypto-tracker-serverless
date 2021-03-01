import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { SymbolPairs } from '@crypto-tracker/common-types';

export class SymbolPairsItem extends DynamoDbItem implements SymbolPairs {

	@attribute()
	public pairs: {
		[symbol: string]: string[];
	};

	@attribute()
	public times: {
		createdAt: string;
		updatedAt: string;
	};

}
