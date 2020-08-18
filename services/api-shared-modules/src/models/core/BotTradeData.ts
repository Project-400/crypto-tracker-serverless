import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { ExchangeInfoSymbol, TransactionFillCommission, PositionState, ISymbolTraderData, SymbolType } from '@crypto-tracker/common-types';

export class BotTradeDataItem extends DynamoDbItem implements ISymbolTraderData {

	@attribute()
	public symbol: string;

	@attribute()
	public base: string;

	@attribute()
	public quote: string;

	@attribute()
	public lowercaseSymbol: string;

	@attribute()
	public baseQty: number;

	@attribute()
	public quoteQty: number;

	@attribute()
	public baseInitialQty: number;

	@attribute()
	public quoteQtySpent: number;

	@attribute()
	public profit: number;

	@attribute()
	public startPrice: number;

	@attribute()
	public currentPrice: number;

	@attribute()
	public priceDifference: number;

	@attribute()
	public percentageDifference: number;

	@attribute()
	public percentageDroppedFromHigh: number;

	@attribute()
	public commissions: TransactionFillCommission[];

	@attribute()
	public state: PositionState;

	@attribute()
	public exchangeInfo?: ExchangeInfoSymbol;

	@attribute()
	public baseMinQty: number;

	@attribute()
	public baseStepSize: number;

	@attribute()
	public highestPriceReached: number;

	@attribute()
	public lowestPriceReached: number;

	@attribute()
	public symbolType: SymbolType;

	@attribute()
	public times: {
		createdAt: Date | string;
		finishedAt?: Date | string;
		savedAt?: Date | string;
	};

}
