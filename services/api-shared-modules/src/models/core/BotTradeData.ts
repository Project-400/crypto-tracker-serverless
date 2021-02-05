import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import {
	ExchangeInfoSymbol,
	PositionState,
	SymbolType,
	IBotTradeData, CommissionTotals, TransactionFill
} from '@crypto-tracker/common-types';

export class TraderBotLogDataItem extends DynamoDbItem implements IBotTradeData {

	@attribute()
	public botId: string;

	@attribute()
	public symbol: string;

	@attribute()
	public base: string;

	@attribute()
	public quote: string;

	@attribute()
	public startedTrading: boolean;

	@attribute()
	public finishedTrading: boolean;

	@attribute()
	public buyDataSet: boolean;

	@attribute()
	public sellDataSet: boolean;


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
	public buyFills: TransactionFill[];

	@attribute()
	public sellFills: TransactionFill[];

	@attribute()
	public commissions: CommissionTotals;

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
		createdAt: string;
		finishedAt?: string;
		savedAt?: string;
	};

	@attribute()
	public userId: string;

	@attribute()
	public averageBuyPrice: number;

	@attribute()
	public averageSellPrice: number;

	@attribute()
	public baseAssetPrecision: number;

	@attribute()
	public highestBuyPrice: number;

	@attribute()
	public highestPriceReachedDuringTrade: number;

	@attribute()
	public highestSellPrice: number;

	@attribute()
	public lowestBuyPrice: number;

	@attribute()
	public lowestPriceReachedDuringTrade: number;

	@attribute()
	public lowestSellPrice: number;

	@attribute()
	public preTradePriceChangeCount: number;

	@attribute()
	public priceChangeCount: number;

	@attribute()
	public priceChangeInterval: number;

	@attribute()
	public quoteAssetPrecision: number;

	@attribute()
	public startTime: number;

}
