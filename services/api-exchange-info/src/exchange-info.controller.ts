import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ErrorCode,
	BinanceExchangeInfoResponse,
	ExchangeInfoSymbol,
} from '../../api-shared-modules/src';
import { ClientRequest, IncomingMessage } from 'http';
import * as https from 'https';

export class ExchangeInfoController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const info: ExchangeInfoSymbol[] = await this.requestExchangeInfo();

		await Promise.all(info.map((i: ExchangeInfoSymbol) => this.unitOfWork.ExchangeInfo.saveExchangeInfo(i)));

		try {
			return ResponseBuilder.ok({ info });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSymbolExchangeInfo: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.symbol || !event.pathParameters.quote)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		let info: ExchangeInfoSymbol;

		try {
			info = await this.unitOfWork.ExchangeInfo.getExchangeInfo(event.pathParameters.symbol, event.pathParameters.quote);
		} catch (err) {
			const allInfo: Array<Partial<ExchangeInfoSymbol>> = await this.requestExchangeInfo();

			const newInfo: Partial<ExchangeInfoSymbol> = allInfo.find((s: ExchangeInfoSymbol) => s.symbol === event.pathParameters.symbol);
			if (!newInfo) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'Symbol exchange info not found');

			info = await this.unitOfWork.ExchangeInfo.saveExchangeInfo(newInfo);
		}

		try {
			return ResponseBuilder.ok({ info });
		} catch (err) {
			console.log(err);
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private requestExchangeInfo = async (): Promise<ExchangeInfoSymbol[]> => {
		let dataString: string = '';

		const pairsString: string = await new Promise((resolve: any, reject: any): void => {
			const req: ClientRequest = https.get(`https://api.binance.com/api/v3/exchangeInfo`, (res: IncomingMessage) => {
				res.on('data', (chunk: any) => dataString += chunk);
				res.on('end', () => {
					resolve(dataString);
				});
			});

			req.on('error', reject);
		});

		const info: BinanceExchangeInfoResponse = JSON.parse(pairsString);
		return info.symbols;
	}

}
