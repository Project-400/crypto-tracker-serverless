import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { PriceChangeStats } from '../../types';

export class PriceChangeStatsItem extends DynamoDbItem implements PriceChangeStats {

	@attribute()
	public symbol: string;

	@attribute()
	public base: string;

	@attribute()
	public quote: string;

	@attribute()
	public currentPrice: number;

	@attribute()
	public times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};

	@attribute()
	public previousPrices: {
		min5: number;
		min10: number;
		min30: number;
		hour: number;
		hour3: number;
		hour6: number;
		hour12: number;
		hour24: number;
	};

	@attribute()
	public priceChanges: {
		min5: number;
		min10: number;
		min30: number;
		hour: number;
		hour3: number;
		hour6: number;
		hour12: number;
		hour24: number;
	};

	@attribute()
	public pricePercentageChanges: {
		min5: number;
		min10: number;
		min30: number;
		hour: number;
		hour3: number;
		hour6: number;
		hour12: number;
		hour24: number;
	};

}
