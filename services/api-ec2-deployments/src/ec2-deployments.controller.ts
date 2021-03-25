import { ApiContext, ApiEvent, ApiHandler } from '../../api-shared-modules/src';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { CodePipeline } from 'aws-sdk';

const codePipeline: CodePipeline = new CodePipeline();

export class Ec2DeploymentsController {

	public constructor(private ec2DeploymentsService: Ec2DeploymentsService) { }

	public addLatestDeployment: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		if (!event['CodePipeline.job']) return codePipeline.putJobFailureResult().promise();

		try {
			const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

			const updated: boolean = await this.ec2DeploymentsService.updateLatestDeployment(codePipelineJob);

			if (updated) {
				const params: { jobId: string } = {
					jobId: codePipelineJob.id
				};

				return codePipeline.putJobSuccessResult(params).promise();
			}

			return codePipeline.putJobFailureResult().promise();
		} catch (err) {
			return codePipeline.putJobFailureResult().promise();
		}
	}

}
