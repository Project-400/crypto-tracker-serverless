import { ApiContext, ApiEvent, ApiHandler, ErrorCode, ResponseBuilder } from '../../api-shared-modules/src';
import { Ec2DeploymentsService } from './ec2-deployments.service';
import { CodePipeline } from 'aws-sdk';
import { PutJobFailureResultInput, PutJobSuccessResultInput } from 'aws-sdk/clients/codepipeline';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';

const codePipeline: CodePipeline = new CodePipeline();

export class Ec2DeploymentsController {

	public constructor(private ec2DeploymentsService: Ec2DeploymentsService) { }

	public addLatestDeployment: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		if (!event['CodePipeline.job']) return codePipeline.putJobFailureResult().promise();

		const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

		try {
			const updated: Ec2InstanceDeployment = await this.ec2DeploymentsService.updateLatestDeployment(codePipelineJob);

			if (updated) {
				const pipelineParams: PutJobSuccessResultInput = {
					jobId: codePipelineJob.id,
					outputVariables: {
						pk: updated.pk,
						sk: updated.sk,
						entity: updated.entity
					}
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
			const failedPipelineParams: PutJobFailureResultInput = {
				jobId: codePipelineJob.id,
				failureDetails: {
					type: 'PermissionError',
					message: 'Failed to publish message to topic'
				}
			};
			return codePipeline.putJobFailureResult(failedPipelineParams).promise();
		}
	}

	public publishDeploymentToTopic: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		if (!event['CodePipeline.job']) return codePipeline.putJobFailureResult().promise();

		const codePipelineJob: CodePipeline.Job = event['CodePipeline.job'];

		try {
			const updated: boolean = await this.ec2DeploymentsService.publishDeploymentToTopic(codePipelineJob);

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
			const failedPipelineParams: PutJobFailureResultInput = {
				jobId: codePipelineJob.id,
				failureDetails: {
					type: 'PermissionError',
					message: `Failed to publish message to topic: ${err}`
				}
			};
			return codePipeline.putJobFailureResult(failedPipelineParams).promise();
		}
	}

	public getLatestDeploymentLog: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<any> => {
		if (!event.pathParameters || !event.pathParameters.appName)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const appName: string = event.pathParameters.appName;

		try {
			const latestDeploy: Ec2InstanceDeployment = await this.ec2DeploymentsService.getLatestDeploymentLog(appName);

			if (latestDeploy) {
				return {
					statusCode: 200,
					body: JSON.stringify(latestDeploy.buildFileLocation)
				};
				// return ResponseBuilder.ok({ fileLocation: latestDeploy.buildFileLocation });
			}

			return ResponseBuilder.internalServerError(new Error('No deployment found'));
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);		}
	}

}
