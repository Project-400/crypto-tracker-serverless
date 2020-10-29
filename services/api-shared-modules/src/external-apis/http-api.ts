import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';
// tslint:disable-next-line:no-duplicate-imports
import * as http from 'http';

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

	public static async post(
		path: string,
		host: string,
		port: number,
		postData: { [key: string]: string },
		headers?: { [key: string]: string }
	): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			const postOptions: any = {
				host,
				path,
				port,
				headers,
				method: 'POST'
			};

			const req: ClientRequest = http.request(postOptions, (res: IncomingMessage) => {
				if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('statusCode=' + res.statusCode));

				let body: any[] = [];

				res.on('data', (chunk: any) => body.push(chunk));

				res.on('end', () => {
					try {
						body = JSON.parse(Buffer.concat(body).toString());
					} catch (e) {
						reject(e);
					}
					resolve(body);
				});
			});

			req.on('error', (e: Error): void => reject(e.message));
			req.write(JSON.stringify(postData));
			req.end();
		});
	}

	public static async put(
		path: string,
		host: string,
		port: number,
		putData: { [key: string]: string },
		headers?: { [key: string]: string }
	): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			const putOptions: any = {
				host,
				path,
				port,
				headers,
				method: 'PUT'
			};

			const req: ClientRequest = http.request(putOptions, (res: IncomingMessage) => {
				if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('statusCode=' + res.statusCode));

				let body: any[] = [];

				res.on('data', (chunk: any) => body.push(chunk));

				res.on('end', () => {
					try {
						body = JSON.parse(Buffer.concat(body).toString());
					} catch (e) {
						reject(e);
					}
					resolve(body);
				});
			});

			req.on('error', (e: Error): void => reject(e.message));
			req.write(JSON.stringify(putData));
			req.end();
		});
	}

}
