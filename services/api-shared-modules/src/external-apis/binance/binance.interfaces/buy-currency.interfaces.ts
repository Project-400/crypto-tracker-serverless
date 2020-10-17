import { BinanceTransactionSide, BinanceTransactionType } from '../binance.enums';

/*
*
*  https://binance-docs.github.io/apidocs/spot/en/#test-new-order-trade
*
* */

export interface BuyCurrencyFill {
	price: string | number;
	qty: string | number;
	commission: string | number;
	commissionAsset: string;
}

// newOrderRespType set to ACK

export interface BuyCurrencyAckDto {
	symbol: string;
	orderId: number;
	orderListId: number; // Unless OCO, value will be -1
	clientOrderId: string;
	transactTime: number;
}

// newOrderRespType set to RESULT

export interface BuyCurrencyResultDto extends BuyCurrencyAckDto {
	price: string | number;
	origQty: string | number;
	executedQty: string | number;
	cummulativeQuoteQty: string | number;
	status: string;
	timeInForce: string;
	type: BinanceTransactionType;
	side: BinanceTransactionSide;
}

// Full Dto is returned when order type is MARKET or LIMIT or newOrderRespType set to FULL

export interface BuyCurrencyFullDto extends BuyCurrencyResultDto {
	fills: BuyCurrencyFill[];
}
