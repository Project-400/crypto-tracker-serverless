import { BinanceTransactionSide, BinanceTransactionType } from '../binance.enums';

/*
*
* This is for both buying and selling currency
*
* https://binance-docs.github.io/apidocs/spot/en/#test-new-order-trade
*
* */

export interface ExchangeCurrencyFill {
	price: string | number;
	qty: string | number;
	commission: string | number;
	commissionAsset: string;
}

// newOrderRespType set to ACK

export interface ExchangeCurrencyAckDto {
	symbol: string;
	orderId: number;
	orderListId: number; // Unless OCO, value will be -1
	clientOrderId: string;
	transactTime: number;
}

// newOrderRespType set to RESULT

export interface ExchangeCurrencyResultDto extends ExchangeCurrencyAckDto {
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

export interface ExchangeCurrencyFullDto extends ExchangeCurrencyResultDto {
	fills: ExchangeCurrencyFill[];
}
