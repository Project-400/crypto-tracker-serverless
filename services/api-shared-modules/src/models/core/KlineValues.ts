import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { KlineValues } from '@crypto-tracker/common-types';
import { VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types/lib/enums';

export class KlineValuesItem extends DynamoDbItem implements KlineValues {

	@attribute()
	public time: string;

	@attribute()
	public updateCount: number;

	@attribute()
	public open: string;

	@attribute()
	public close?: string;

	@attribute()
	public lowest: string;

	@attribute()
	public highest: string;

	@attribute()
	public lastValue: string;

	@attribute()
	public change: string;

	@attribute()
	public changePercentage: string;

	@attribute()
	public interval: VALUE_LOG_INTERVAL;

	@attribute()
	public isClosed: boolean;

	@attribute()
	public times: {
		createdAt: string;
		updatedAt?: string;
		valueStartingAt?: string;
		valueEndingAt?: string;
	};

}
