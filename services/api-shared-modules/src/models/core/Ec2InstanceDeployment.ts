import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';

export class Ec2InstanceDeploymentItem extends DynamoDbItem implements Ec2InstanceDeployment {

	@attribute()
	public deploymentId: string;

	@attribute()
	public codePipelineJobId: string;

	@attribute()
	public appName: string;

	@attribute()
	public preBuild: {
		bucketName: string;
		objectKey: string;
	};

	@attribute()
	public postBuild: {
		bucketName: string;
		objectKey: string;
	};

	@attribute()
	public buildFileLocation: string;

	@attribute()
	public times: {
		createdAt: Date | string;
	};

}
