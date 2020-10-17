import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';

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

}
