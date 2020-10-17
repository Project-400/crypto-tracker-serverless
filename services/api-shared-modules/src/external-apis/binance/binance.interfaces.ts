export interface CoinNetwork {
	network: string;
	coin: string;
	withdrawIntegerMultiple: number;
	isDefault: boolean;
	depositEnable: boolean;
	withdrawEnable: boolean;
	depositDesc: string;
	withdrawDesc: string;
	specialTips: string;
	name: string;
	resetAddressStatus: boolean;
	addressRegex: string;
	memoRegex: string;
	withdrawFee: number;
	withdrawMin: number;
	withdrawMax: number;
	minConfirm: number;
	unLockConfirm: number;
}

export interface Coin {
	coin: string;
	depositAllEnable: boolean;
	withdrawAllEnable: boolean;
	name: string;
	free: number;
	locked: number;
	freeze: number;
	withdrawing: number;
	ipoing: number;
	ipoable: number;
	storage: number;
	isLegalMoney: boolean;
	trading: boolean;
	networkList: CoinNetwork[];
}

export interface GetSymbolPriceDto {
	symbol: string,
	price: string
}

export interface DustLog {
	tranId: number;
	serviceChargeAmount: string | number;
	uid: number;
	amount: number;
	operateTime: string;
	transferedAmount: number;
	fromAsset: string;
}

export interface DustLogRow {
	transfered_total: string | number; // Total transfered BNB amount for this exchange
	service_charge_total: string | number; // Total service charge amount for this exchange
	tran_id: number;
	logs: DustLog[]; // Details of this exchange.
	operate_time: string; // The time of this exchange
}

export interface GetDustLogsDto {
	success: boolean;
	results: {
		total: number; // Total counts of exchange
		rows: DustLogRow[];
	}
}
