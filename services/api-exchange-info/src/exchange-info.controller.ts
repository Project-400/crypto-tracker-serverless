import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	ErrorCode,
} from '../../api-shared-modules/src';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

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
		if (
			!event.pathParameters ||
			!event.pathParameters.symbol ||
			!event.pathParameters.quote
		) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

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

	public requestExchangeInfo = async (): Promise<ExchangeInfoSymbol[]> => {
		const info: GetExchangeInfoDto = await BinanceApi.GetExchangeInfo();
		return info.symbols;
	}

}
