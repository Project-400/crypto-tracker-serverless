import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import { BINANCE_API_KEY, BINANCE_API_SECRET_KEY } from '../../../environment/env';
import * as crypto from 'crypto';
import * as qs from 'qs';

export class TransactionsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public buyCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const dataString: string = await new Promise((resolve: any, reject: any): void => {
			let ds: string = '';

			const data: string = qs.stringify({
				symbol: 'ASTBTC',
				side: 'BUY',
				quoteOrderQty: 0.0001,
				type: 'MARKET',
				timestamp: new Date().getTime(),
				recvWindow: 10000
			});

			const signature: string
				= crypto
				.createHmac('sha256', BINANCE_API_SECRET_KEY)
				.update(data)
				.digest('hex');

			console.log('Requesting');

			const req: ClientRequest = https.get({ // https.request not working - Using https.get with POST method (It works?)
				host: 'api.binance.com',
				port: 443,
				path: `/api/v3/order?${data}&signature=${signature}`,
				method: 'POST',
				headers: {
					'X-MBX-APIKEY': BINANCE_API_KEY
				}
			}, (res: IncomingMessage) => {
				console.log(res);
				res.on('data', (chunk: any) => ds += chunk);
				res.on('end', () => {
					resolve(ds);
				});
			});

			req.on('error', reject);
		});

		const response: any = JSON.parse(dataString);

		try {
			return ResponseBuilder.ok({ response });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
