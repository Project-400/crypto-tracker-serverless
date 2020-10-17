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
