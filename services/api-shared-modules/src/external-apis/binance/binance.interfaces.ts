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
