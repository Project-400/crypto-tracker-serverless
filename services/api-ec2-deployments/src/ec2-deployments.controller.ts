import { ApiContext, ApiEvent, ApiHandler } from '../../api-shared-modules/src';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { CodePipeline } from 'aws-sdk';
import { PutJobFailureResultInput, PutJobSuccessResultInput } from 'aws-sdk/clients/codepipeline';

const codePipeline: CodePipeline = new CodePipeline();

export class Ec2DeploymentsController {

	public constructor(private ec2DeploymentsService: Ec2DeploymentsService) { }

	public addLatestDeployment: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		if (!event['CodePipeline.job']) return codePipeline.putJobFailureResult().promise();

		try {
			const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

			const updated: boolean = await this.ec2DeploymentsService.updateLatestDeployment(codePipelineJob);

			if (updated) {
				const pipelineParams: PutJobSuccessResultInput = {
					jobId: codePipelineJob.id
				};

				return codePipeline.putJobSuccessResult(pipelineParams).promise();
			}

			const failedPipelineParams: PutJobFailureResultInput = {
				jobId: codePipelineJob.id,
				failureDetails: {
					type: 'PermissionError',
					message: 'Failed to publish message to topic'
				}
			};

			return codePipeline.putJobFailureResult(failedPipelineParams).promise();
		} catch (err) {
			return codePipeline.putJobFailureResult().promise();
		}
	}

	public publishDeploymentToTopic: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		console.log(event);
		console.log(JSON.stringify(event));
		if (!event['CodePipeline.job']) return codePipeline.putJobFailureResult().promise();

		try {
			const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

			const updated: boolean = await this.ec2DeploymentsService.publishDeploymentToTopic(codePipelineJob);

			console.log('updated');
			console.log(updated);

			if (updated) {
				const pipelineParams: PutJobSuccessResultInput = {
					jobId: codePipelineJob.id
				};

				return codePipeline.putJobSuccessResult(pipelineParams).promise();
			}

			const failedPipelineParams: PutJobFailureResultInput = {
				jobId: codePipelineJob.id,
				failureDetails: {
					type: 'PermissionError',
					message: 'Failed to publish message to topic'
				}
			};

			return codePipeline.putJobFailureResult(failedPipelineParams).promise();
		} catch (err) {
			return codePipeline.putJobFailureResult().promise();
		}
	}

}
