export enum BinanceRateLimitType {
	REQUEST_WEIGHT = 'REQUEST_WEIGHT',
	ORDERS = 'ORDERS',
	RAW_REQUESTS = 'RAW_REQUESTS'
}

export enum BinanceRateInterval {
	SECOND = 'SECOND',
	MINUTE = 'MINUTE',
	DAY = 'DAY'
}

export enum BinanceExchangeFilter {
	PERCENT_PRICE = 'PERCENT_PRICE',
	LOT_SIZE = 'LOT_SIZE',
	MIN_NOTIONAL = 'MIN_NOTIONAL',
	ICEBERG_PARTS = 'ICEBERG_PARTS',
	MARKET_LOT_SIZE = 'MARKET_LOT_SIZE',
	MAX_NUM_ORDERS = 'MAX_NUM_ORDERS',
	MAX_NUM_ALGO_ORDERS = 'MAX_NUM_ALGO_ORDERS',
	MAX_NUM_ICEBERG_ORDERS = 'MAX_NUM_ICEBERG_ORDERS',
	MAX_POSITION = 'MAX_POSITION',
	EXCHANGE_MAX_NUM_ORDERS = 'EXCHANGE_MAX_NUM_ORDERS',
	EXCHANGE_MAX_NUM_ALGO_ORDERS = 'EXCHANGE_MAX_NUM_ALGO_ORDERS'
}
