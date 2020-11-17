import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { Transaction, TransactionRequest } from '../../api-shared-modules/src/types';
import { BinanceTransactionSide, BinanceTransactionType } from '../../api-shared-modules/src/external-apis/binance/binance.enums';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { BuyCurrencyData, SellCurrencyData } from './transactions.interfaces';
import { ExchangeCurrencyTransactionFull } from '@crypto-tracker/common-types';

export class TransactionsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public buyCurrency = async (userId: string, buyInfo: Partial<BuyCurrencyData>): Promise<Transaction> => {
		const request: TransactionRequest = {
			symbol: buyInfo.symbol,
			side: BinanceTransactionSide.BUY,
			quoteOrderQty: buyInfo.quantity,
			type: BinanceTransactionType.MARKET
		};

		let response: ExchangeCurrencyTransactionFull;
		try {
			response = await BinanceApi.BuyCurrency(request, buyInfo.isTest);
		} catch (err) {
			throw Error(`Unable to buy Currency via Binance. ${err}`);
		}

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

		let response: ExchangeCurrencyTransactionFull;
		try {
			response = await BinanceApi.SellCurrency(request, sellInfo.isTest);
		} catch (err) {
			throw Error(`Unable to sell Currency via Binance. ${err}`);
		}

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
