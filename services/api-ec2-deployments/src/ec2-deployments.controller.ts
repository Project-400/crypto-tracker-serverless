import { ApiContext, ApiEvent, ApiHandler, ApiResponse, ErrorCode, ResponseBuilder } from '../../api-shared-modules/src';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { CodePipeline } from 'aws-sdk';

export class Ec2DeploymentsController {

	public constructor(private ec2DeploymentsService: Ec2DeploymentsService) { }

	public addLatestDeployment: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		// const auth: TokenVerification = Auth.VerifyToken('');
		// const userId: string = auth.sub;

		console.log(event);

		if (!event['CodePipeline.job']) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'CodePipeline Job Missing');

		try {
			const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

			const updated: boolean = await this.ec2DeploymentsService.updateLatestDeployment(codePipelineJob);

			return ResponseBuilder.ok({ event, updated });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
