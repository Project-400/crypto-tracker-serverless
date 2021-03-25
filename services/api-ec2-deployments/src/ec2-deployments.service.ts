import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { CodePipeline } from 'aws-sdk';

export class Ec2DeploymentsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public updateLatestDeployment = async (codePipelineJob: CodePipeline.Job): Promise<boolean> => {

	}

}
