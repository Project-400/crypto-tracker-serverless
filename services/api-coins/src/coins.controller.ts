import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ErrorCode,
	ResponseBuilder
} from '../../api-shared-modules/src';
import { Coin } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import Auth, { TokenVerification } from '../../_auth/verify';
import { CoinsService } from './coins.service';

export class CoinsController {

	public constructor(private coinsService: CoinsService) { }

	public getAllCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const coins: Coin[] = await this.coinsService.getAllCoins(userId);

			return ResponseBuilder.ok({ coins });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getSpecifiedCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.coins)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const coinNames: string[] = event.pathParameters.coins.split(',');

		try {
			const coins: Coin[] = await this.coinsService.getSpecifiedCoins(userId, coinNames);

			return ResponseBuilder.ok({ coins });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public gatherUserCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const count: number = await this.coinsService.gatherUserCoins(userId);

			return ResponseBuilder.ok({ coinsGathered: count });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getInvestmentChange: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.coin)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const coin: string = event.pathParameters.coin.toUpperCase();

		try {
			const changes: any = this.coinsService.getInvestmentChange(coin);

			return ResponseBuilder.ok({ trades: changes.sortedTrades.length, diff: changes.diff, details: changes.details });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
