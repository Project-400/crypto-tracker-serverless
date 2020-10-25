import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { Transaction, TransactionRequest } from '../../api-shared-modules/src/types';
import { BinanceTransactionSide, BinanceTransactionType } from '../../api-shared-modules/src/external-apis/binance/binance.enums';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { BuyCurrencyData, SellCurrencyData } from './transactions.interfaces';
import {
	ExchangeCurrencyFullDto
} from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/exchange-currency.interfaces';

export class TransactionsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public buyCurrency = async (userId: string, buyInfo: Partial<BuyCurrencyData>): Promise<Transaction> => {
		const request: TransactionRequest = {
			symbol: buyInfo.symbol,
			side: BinanceTransactionSide.BUY,
			quoteOrderQty: buyInfo.quantity,
			type: BinanceTransactionType.MARKET
		};

		const response: ExchangeCurrencyFullDto = await BinanceApi.BuyCurrency(request);

		const transaction: Partial<Transaction> = {
			request,
			response,
			symbol: buyInfo.symbol,
			base: buyInfo.base,
			quote: buyInfo.quote,
			completed: response.status === 'FILLED'
		};

		let savedTransaction: Transaction;

		savedTransaction = await this.unitOfWork.Transactions.save(userId, transaction);

		return savedTransaction;
	}

	public sellCurrency = async (userId: string, sellInfo: Partial<SellCurrencyData>): Promise<Transaction> => {
		const request: TransactionRequest = {
			symbol: sellInfo.symbol,
			side: BinanceTransactionSide.SELL,
			quantity: sellInfo.quantity,
			type: BinanceTransactionType.MARKET
		};

		const response: ExchangeCurrencyFullDto = await BinanceApi.SellCurrency(request);

		const transaction: Partial<Transaction> = {
			request,
			response,
			symbol: sellInfo.symbol,
			base: sellInfo.base,
			quote: sellInfo.quote,
			completed: response.status === 'FILLED'
		};

		let savedTransaction: Transaction;

		savedTransaction = await this.unitOfWork.Transactions.save(userId, transaction);

		return savedTransaction;
	}

}
