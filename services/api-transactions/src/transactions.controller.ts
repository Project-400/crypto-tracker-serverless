import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	ErrorCode,
	Transaction
} from '../../api-shared-modules/src';
import { BuyCurrencyData, SellCurrencyData } from './transactions.interfaces';
import Auth, { TokenVerification } from '../../_auth/verify';
import { TransactionsService } from './transactions.service';

export class TransactionsController {

	public constructor(private transactionsService: TransactionsService) { }

	public buyCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		// TODO: Only take in symbol - get base and quote from DB

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const buyInfo: Partial<BuyCurrencyData> = JSON.parse(event.body);

		if (
			!buyInfo.symbol ||
			!buyInfo.base ||
			!buyInfo.quote ||
			!buyInfo.quantity
		) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		try {
			const savedTransaction: Transaction = await this.transactionsService.buyCurrency(userId, buyInfo);

			return ResponseBuilder.ok({ transaction: savedTransaction });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public sellCurrency: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const sellInfo: Partial<SellCurrencyData> = JSON.parse(event.body);

		if (
			!sellInfo.symbol ||
			!sellInfo.base ||
			!sellInfo.quote ||
			!sellInfo.quantity
		) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		try {
			const savedTransaction: Transaction = await this.transactionsService.sellCurrency(userId, sellInfo);

			return ResponseBuilder.ok({ transaction: savedTransaction });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
