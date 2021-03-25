import { ApiContext, ApiEvent, ApiHandler, ApiResponse, ResponseBuilder } from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { CodePipeline } from 'aws-sdk';

export class Ec2DeploymentsController {

	public constructor(private ec2DeploymentsService: Ec2DeploymentsService) { }

	public updateLatestDeployment: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => { // old data
		// if (!event.pathParameters || !event.pathParameters.time)
		// 	return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

			const updated: boolean = await this.ec2DeploymentsService.updateLatestDeployment(codePipelineJob);

			return ResponseBuilder.ok({ event });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
