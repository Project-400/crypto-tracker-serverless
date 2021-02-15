import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { WalletValuation, WalletValue } from '@crypto-tracker/common-types';

export class WalletValuationItem extends DynamoDbItem implements WalletValuation {

	@attribute()
	public walletValuationId: string;

	@attribute()
	public userId: string;

	@attribute()
	public values: WalletValue[];

	@attribute()
	public times: {
		createdAt: string;
		updatedAt?: string;
		valueStartingAt: string;
		valueEndingAt?: string;
	};

}
