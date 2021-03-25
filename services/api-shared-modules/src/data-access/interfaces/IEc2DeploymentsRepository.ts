import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';

export interface IEc2DeploymentsRepository {
	get(appName: string, codePipelineJobId: string): Promise<Ec2InstanceDeployment>;
	create(ec2Deployment: Partial<Ec2InstanceDeployment>): Promise<Ec2InstanceDeployment>;
}
