import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ExchangeInfo, ExchangeInfoFilters, ExchangeInfoRateLimiters, ExchangeInfoSymbol } from '../../types';

export class ExchangeInfoItem extends DynamoDbItem implements ExchangeInfo {

	@attribute()
	public timezone: string;

	@attribute()
	public serverTime: number;

	@attribute()
	public rateLimits: ExchangeInfoRateLimiters[];

	@attribute()
	public exchangeFilters: ExchangeInfoFilters[];

	@attribute()
	public symbols: ExchangeInfoSymbol[];

	@attribute()
	public times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};

}
