import { ApiContext, ApiEvent, ApiHandler, ApiResponse, ErrorCode, ResponseBuilder } from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';

export class Ec2DeploymentsController {

	public constructor() { }

	public retrieveValuationLog: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => { // old data
		if (!event.pathParameters || !event.pathParameters.time)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {

			return ResponseBuilder.ok({ log });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
