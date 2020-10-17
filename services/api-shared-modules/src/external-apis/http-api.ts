import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
import { BINANCE_API_HOST } from '../../../../environment/env';

export class HttpApi {

	public static async get(url: string, headers?: { [key: string]: string }): Promise<string> {
		return new Promise((resolve: any, reject: any): void => {
			let dataString: string = '';

			const req: ClientRequest = https.get(url, { headers }, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => resolve(dataString));
			});

			req.on('error', reject);
		});
	}

	public static async post(url: string, headers?: { [key: string]: string }): Promise<string> {
		return new Promise((resolve: any, reject: any): void => {
			let dataString: string = '';

			const req: ClientRequest = https.get({ // https.request not working - Using https.get with POST method (It works?)
				host: BINANCE_API_HOST,
				port: 443,
				path: url,
				method: 'POST',
				headers
			}, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => resolve(dataString));
			});

			req.on('error', reject);
		});
	}

}
