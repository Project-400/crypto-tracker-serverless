import { attribute, hashKey, rangeKey, table } from '@aws/dynamodb-data-mapper-annotations';

export interface DbItem {
	pk: string;
	sk: string;
	sk2: string;
	sk3: string;
	entity: string;
}

// TODO: Implement a mechanism to change this automatically based on environment
@table('dev-CryptoTracker-GENERAL')
export class DynamoDbItem implements DbItem {
	@hashKey()
	public pk!: string;

	@rangeKey()
	public sk!: string;

	@rangeKey()
	public sk2!: string;

	@rangeKey()
	public sk3!: string;

	@attribute()
	public entity!: string;
}
