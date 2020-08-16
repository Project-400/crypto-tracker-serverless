import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ExchangeInfoSymbol } from '../../types';

export class ExchangeInfoSymbolItem extends DynamoDbItem implements ExchangeInfoSymbol {

	@attribute()
	public symbol: string;

	@attribute()
	public status: string;

	@attribute()
	public baseAsset: string;

	@attribute()
	public baseAssetPrecision: number;

	@attribute()
	public quoteAsset: string;

	@attribute()
	public quotePrecision: number;

	@attribute()
	public quoteAssetPrecision: number;

	@attribute()
	public orderTypes: string[];

	@attribute()
	public icebergAllowed: boolean;

	@attribute()
	public ocoAllowed: boolean;

	@attribute()
	public isSpotTradingAllowed: boolean;

	@attribute()
	public isMarginTradingAllowed: boolean;

	@attribute()
	public filters: any[];

	@attribute()
	public permissions: string[];

	@attribute()
	public times: {
		createdAt: Date | string;
		updatedAt: Date | string;
	};

}
