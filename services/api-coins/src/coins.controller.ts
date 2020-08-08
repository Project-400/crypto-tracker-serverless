import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import * as crypto from 'crypto';
import * as qs from 'qs';

export class CoinsController {

	public getCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		console.log('IN FUNCTION');

		let dataString: string = '';
		const coins: any = await new Promise((resolve: any, reject: any): void => {
			const data: string = qs.stringify({
				timestamp: new Date().getTime(),
				recvWindow: 10000
			});

			const signature: string
				= crypto
				.createHmac('sha256', 'PXxkSDbB86BKWlNOQYaQ1uujRQHBFoXiDjEUes2mNXAbsI07teWmVei8JPchIIoD')
				.update(data)
				.digest('hex');

			const req: ClientRequest = https.get(`https://api.binance.com/sapi/v1/capital/config/getall?${data}&signature=${signature}`, {
				headers: {
					'X-MBX-APIKEY': '5EEJO4BQMHaVTVMZFHyBTEPBWSYAwt1va0rbuo9hrL1o6p7ls4xDHsSILCu4DANj'
				}
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(JSON.parse(dataString));
				});
			});

			req.on('error', reject);
		});

		try {
			return ResponseBuilder.ok({ coins });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
