import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import AWS, { CodePipeline, SNS } from 'aws-sdk';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';
import { v4 as uuid } from 'uuid';
import { ActionConfigurationKey, Artifact } from 'aws-sdk/clients/codepipeline';
import { AWS_ACCOUNT_ID, AWS_NEW_DEPLOYMENT_SNS_TOPIC, AWS_REGION } from '../../../environment/env';

interface DeploymentUserParameters {
	appName: string;
}

export class Ec2DeploymentsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public updateLatestDeployment = async (codePipelineJob: CodePipeline.Job): Promise<Ec2InstanceDeployment> => {
		const sourceArtifact: Artifact = codePipelineJob.data.inputArtifacts.find((a: Artifact) => a.name === 'SourceArtifact');
		const buildArtifact: Artifact = codePipelineJob.data.inputArtifacts.find((a: Artifact) => a.name === 'ExpressBuildArtifact');
		const buildFileLocation: string = `s3://${buildArtifact.location.s3Location.bucketName}/${buildArtifact.location.s3Location.objectKey}`;
		const userParameters: ActionConfigurationKey = codePipelineJob.data.actionConfiguration.configuration.UserParameters;
		const userParametersObject: DeploymentUserParameters = JSON.parse(userParameters);
		const appName: string = userParametersObject.appName || 'Unknown';

		const deployment: Partial<Ec2InstanceDeployment> = {
			deploymentId: uuid(),
			codePipelineJobId: codePipelineJob.id,
			appName,
			preBuild: {
				bucketName: sourceArtifact.location.s3Location.bucketName,
				objectKey: sourceArtifact.location.s3Location.objectKey
			},
			postBuild: {
				bucketName: buildArtifact.location.s3Location.bucketName,
				objectKey: buildArtifact.location.s3Location.objectKey
			},
			buildFileLocation
		};

		return this.unitOfWork.Ec2Deployments.create(deployment);
	}

	public publishDeploymentToTopic = async (codePipelineJob: CodePipeline.Job): Promise<boolean> => {
		const userParameters: ActionConfigurationKey = codePipelineJob.data.actionConfiguration.configuration.UserParameters;
		const userParametersObject: DeploymentUserParameters = JSON.parse(userParameters);
		const appName: string = userParametersObject.appName || 'Unknown';

		const sns: SNS = new SNS({ apiVersion: '2010-03-31' });

		const ec2Deployment: Ec2InstanceDeployment = await this.unitOfWork.Ec2Deployments.get(appName, codePipelineJob.id);

		const snsParams: SNS.PublishInput = {
			Message: JSON.stringify({ ec2Deployment }),
			TopicArn: `arn:aws:sns:${AWS_REGION}:${AWS_ACCOUNT_ID}:${AWS_NEW_DEPLOYMENT_SNS_TOPIC}`
		};

		return new Promise((resolve: any, reject: any): void => {
			sns.publish(snsParams, (err: AWS.AWSError, data: AWS.SNS.PublishResponse): void => {
				if (err) reject(false);
				else resolve(true);
			});
		});
	}

}
