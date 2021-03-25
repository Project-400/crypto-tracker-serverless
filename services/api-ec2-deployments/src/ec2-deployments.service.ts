import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { CodePipeline } from 'aws-sdk';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';
import { v4 as uuid } from 'uuid';
import { ActionConfigurationKey, Artifact } from 'aws-sdk/clients/codepipeline';

interface DeploymentUserParamters {
	appName: string;
}

export class Ec2DeploymentsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public updateLatestDeployment = async (codePipelineJob: CodePipeline.Job): Promise<boolean> => {
		const sourceArtifact: Artifact = codePipelineJob.data.inputArtifacts.find((a: Artifact) => a.name === 'SourceArtifact');
		const buildArtifact: Artifact = codePipelineJob.data.inputArtifacts.find((a: Artifact) => a.name === 'ExpressBuildArtifact');
		const buildFileLocation: string = `s3://${buildArtifact.location.s3Location.bucketName}/${buildArtifact.location.s3Location.objectKey}`;
		const userParameters: ActionConfigurationKey = codePipelineJob.data.actionConfiguration.configuration.UserParameters;
		const userParametersObject: DeploymentUserParamters = JSON.parse(userParameters);
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

		console.log('DEPLOYMENT');
		console.log(deployment);

		const deploymentLog: Ec2InstanceDeployment = await this.unitOfWork.Ec2Deployments.create(deployment);

		console.log('LOG');
		console.log(deploymentLog);

		return !!deploymentLog;
	}

}
