import http from 'http';
import https from 'https';

export class HttpApi {

	public static async get(url: string, secureHttp: boolean, headers?: { [key: string]: string }): Promise<string> {
		return new Promise((resolve: any, reject: any): void => {
			let dataString: string = '';

			const req: http.ClientRequest = secureHttp ?
				https.get(url, { headers }, (res: http.IncomingMessage) => {
					res.on('data', (chunk: any) => dataString += chunk);
					res.on('end', () => resolve(dataString));
				}) :
				http.get(url, { headers }, (res: http.IncomingMessage) => {
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
		headers?: { [key: string]: string },
		postData?: { [key: string]: string }
	): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			const postOptions: any = {
				host,
				path,
				port,
				headers,
				method: 'POST'
			};

			const req: http.ClientRequest = http.request(postOptions, (res: http.IncomingMessage) => {
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
			if (postData) req.write(JSON.stringify(postData));
			req.end();
		});
	}

	public static async put(
		path: string,
		host: string,
		port: number,
		headers?: { [key: string]: string },
		putData?: { [key: string]: string }
	): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			const putOptions: any = {
				host,
				path,
				port,
				headers,
				method: 'PUT'
			};

			const req: http.ClientRequest = http.request(putOptions, (res: http.IncomingMessage) => {
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
			if (putData) req.write(JSON.stringify(putData));
			req.end();
		});
	}

}
