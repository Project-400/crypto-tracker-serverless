import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ResponseBuilder
} from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';
import { CoinCount, ValuationService } from './valuation.service';

export class ValuationController {

	public constructor(private valuationService: ValuationService) { }

	public getValuation: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const values: CoinCount[] = await this.valuationService.getValuation([
				{ coin: 'ALPHA', coinCount: 299.7 },
				{ coin: 'ZRX', coinCount: 30 },
				{ coin: 'SUSHI', coinCount: 31.705263 },
				{ coin: 'SPARTA', coinCount: 160 },
				{ coin: 'DOGE', coinCount: 2500 },
				{ coin: 'BAKE', coinCount: 325 },
				{ coin: 'YOYO', coinCount: 1000 },
				{ coin: 'USDT', coinCount: 10 },
				{ coin: 'BUSD', coinCount: 20 },
				{ coin: 'TUSD', coinCount: 30 },
			]);
			return ResponseBuilder.ok({ values });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
