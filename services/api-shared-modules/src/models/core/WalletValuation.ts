import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { WalletValue } from '@crypto-tracker/common-types';
import { VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types/lib/enums';

export class WalletValuationItem extends DynamoDbItem implements WalletValue {

	@attribute()
	public value: string;

	@attribute()
	public time: string;

	@attribute()
	public interval: VALUE_LOG_INTERVAL;

	@attribute()
	public times: {
		createdAt: string;
	};

}
