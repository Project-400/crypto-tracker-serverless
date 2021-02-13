import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse, ErrorCode,
	ResponseBuilder
} from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';
import { CoinCount, ValuationService } from './valuation.service';
import { CoinsService } from '../../api-coins/src/coins.service';
import { Coin } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';

export class ValuationController {

	public constructor(
		private valuationService: ValuationService,
		private coinsService: CoinsService
	) { }

	public getValuation: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.coins)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const coinNames: string[] = event.pathParameters.coins.split(',');

		try {
			const coinCounts: CoinCount[] = (await this.coinsService.getSpecifiedCoins(userId, coinNames))
				.map((c: Coin) => ({
					coin: c.coin,
					coinCount: c.free
				}));

			const values: CoinCount[] = await this.valuationService.getValuation(coinCounts);
			const totalValue: string = this.valuationService.calculateValueTotal(values);

			return ResponseBuilder.ok({ values, totalValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getValuationForAllCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const coinCounts: CoinCount[] = (await this.coinsService.getAllCoins(userId))
				.map((c: Coin) => ({
					coin: c.coin,
					coinCount: c.free
				}));

			const values: CoinCount[] = await this.valuationService.getValuation(coinCounts);
			const totalValue: string = this.valuationService.calculateValueTotal(values);

			return ResponseBuilder.ok({ values, totalValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
