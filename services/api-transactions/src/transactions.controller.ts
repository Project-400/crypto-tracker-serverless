import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ErrorCode,
	Transaction,
	TransactionRequest,
} from '../../api-shared-modules/src';
import { BuyCurrencyData, SellCurrencyData } from './transactions.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { BinanceTransactionSide, BinanceTransactionType } from '../../api-shared-modules/src/external-apis/binance/binance.enums';
import {
	ExchangeCurrencyFullDto
} from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/exchange-currency.interfaces';

export class TransactionsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public buyCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const buyInfo: Partial<BuyCurrencyData> = JSON.parse(event.body);

		if (!buyInfo.symbol || !buyInfo.base || !buyInfo.quote || !buyInfo.quantity)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

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

		savedTransaction = await this.unitOfWork.Transactions.save(transaction);

		console.log(savedTransaction);

		try {
			return ResponseBuilder.ok({ transaction: savedTransaction });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public sellCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const sellInfo: Partial<SellCurrencyData> = JSON.parse(event.body);

		console.log(sellInfo);

		if (!sellInfo.symbol || !sellInfo.base || !sellInfo.quote || !sellInfo.quantity)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		if (!sellInfo.quote) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid Quantity');

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

		savedTransaction = await this.unitOfWork.Transactions.save(transaction);

		console.log(savedTransaction);

		try {
			return ResponseBuilder.ok({ transaction: savedTransaction });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
