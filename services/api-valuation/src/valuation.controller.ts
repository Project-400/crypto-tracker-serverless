import {
	ApiContext,
	ApiEvent,
	ApiHandler,
	ApiResponse,
	ResponseBuilder
} from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';
import { ValuationService } from './valuation.service';

export class ValuationController {

	public constructor(private valuationService: ValuationService) { }

	public getValuation: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			return ResponseBuilder.ok({ });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
