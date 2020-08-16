import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ErrorCode, Transaction, TransactionRequest,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import { BINANCE_API_HOST, BINANCE_API_KEY, BINANCE_API_SECRET_KEY } from '../../../environment/env';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { BuyCurrencyData, SellCurrencyData } from './transactions.interfaces';

export class TransactionsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public buyCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const buyInfo: Partial<BuyCurrencyData> = JSON.parse(event.body);

		if (!buyInfo.symbol || !buyInfo.base || !buyInfo.quote || !buyInfo.quantity)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const request: TransactionRequest = {
			symbol: buyInfo.symbol,
			side: 'BUY',
			quoteOrderQty: buyInfo.quantity,
			type: 'MARKET',
			timestamp: new Date().getTime(),
			recvWindow: 10000
		};

		const dataString: string = await new Promise((resolve: any, reject: any): void => {
			let ds: string = '';

			const data: string = qs.stringify(request);

			const signature: string
				= crypto
				.createHmac('sha256', BINANCE_API_SECRET_KEY)
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get({ // https.request not working - Using https.get with POST method (It works?)
				host: BINANCE_API_HOST,
				port: 443,
				path: `/api/v3/order${buyInfo.isTest ? '/test' : ''}?${data}&signature=${signature}`,
				method: 'POST',
				headers: {
					'X-MBX-APIKEY': BINANCE_API_KEY
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => ds += chunk);
				res.on('end', () => {
					resolve(ds);
				});
			});

			req.on('error', reject);
		});

		const response: any = JSON.parse(dataString);

		// const response: any = {
		// 	"symbol": "WAVESBTC",
		// 	"orderId": 148133651,
		// 	"orderListId": -1,
		// 	"clientOrderId": "eRzc6odXiHK8CfuxmT7w9L",
		// 	"transactTime": 1597586336023,
		// 	"price": "0.00000000",
		// 	"origQty": "0.57000000",
		// 	"executedQty": "0.57000000",
		// 	"cummulativeQuoteQty": "0.00019750",
		// 	"status": "FILLED",
		// 	"timeInForce": "GTC",
		// 	"type": "MARKET",
		// 	"side": "BUY",
		// 	"fills": [
		// 		{
		// 			"price": "0.00034100",
		// 			"qty": "0.57000000",
		// 			"commission": "0.00057000",
		// 			"commissionAsset": "WAVES",
		// 			"tradeId": 27496461
		// 		}
		// 	]
		// };

		const transaction: Partial<Transaction> = {
			request,
			response,
			symbol: buyInfo.symbol,
			base: buyInfo.base,
			quote: buyInfo.quote,
			completed: !(response.code && response.msg)
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

		if (!sellInfo.symbol || !sellInfo.base || !sellInfo.quote || !sellInfo.quantity)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const request: TransactionRequest = {
			symbol: sellInfo.symbol,
			side: 'SELL',
			quantity: sellInfo.quantity,
			type: 'MARKET',
			timestamp: new Date().getTime(),
			recvWindow: 10000
		};

		const dataString: string = await new Promise((resolve: any, reject: any): void => {
			let ds: string = '';

			const data: string = qs.stringify(request);

			const signature: string
				= crypto
				.createHmac('sha256', BINANCE_API_SECRET_KEY)
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get({ // https.request not working - Using https.get with POST method (It works?)
				host: BINANCE_API_HOST,
				port: 443,
				path: `/api/v3/order${sellInfo.isTest ? '/test' : ''}?${data}&signature=${signature}`,
				method: 'POST',
				headers: {
					'X-MBX-APIKEY': BINANCE_API_KEY
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => ds += chunk);
				res.on('end', () => {
					resolve(ds);
				});
			});

			req.on('error', reject);
		});

		const response: any = JSON.parse(dataString);

		// const response: any = {
		// 	"symbol": "WAVESBTC",
		// 	"orderId": 148134509,
		// 	"orderListId": -1,
		// 	"clientOrderId": "flBChVWHPVTRntje5rXZYs",
		// 	"transactTime": 1597586390982,
		// 	"price": "0.00000000",
		// 	"origQty": "0.50000000",
		// 	"executedQty": "0.50000000",
		// 	"cummulativeQuoteQty": "0.00017215",
		// 	"status": "FILLED",
		// 	"timeInForce": "GTC",
		// 	"type": "MARKET",
		// 	"side": "SELL",
		// 	"fills": [
		// 		{
		// 			"price": "0.00034430",
		// 			"qty": "0.50000000",
		// 			"commission": "0.00000017",
		// 			"commissionAsset": "BTC",
		// 			"tradeId": 27496591
		// 		}
		// 	]
		// };

		const transaction: Partial<Transaction> = {
			request,
			response,
			symbol: sellInfo.symbol,
			base: sellInfo.base,
			quote: sellInfo.quote,
			completed: !(response.code && response.msg)
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
