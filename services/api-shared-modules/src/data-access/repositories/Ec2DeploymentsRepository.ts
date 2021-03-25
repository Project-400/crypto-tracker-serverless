import { Repository } from './Repository';
import { Entity } from '../../types/entities';
import { IEc2DeploymentsRepository } from '../interfaces/IEc2DeploymentsRepository';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';
import { Ec2InstanceDeploymentItem } from '../../models/core';
import { EntitySortType } from '../../types/entity-sort-types';

export class Ec2DeploymentsRepository extends Repository implements IEc2DeploymentsRepository {

	public async create(ec2Deployment: Partial<Ec2InstanceDeployment>): Promise<Ec2InstanceDeployment> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new Ec2InstanceDeploymentItem(), {
			pk: `${Entity.EC2_INSTANCE_DEPLOYMENT}#${ec2Deployment.appName}`,
			sk: `${EntitySortType.PIPELINE_JOB_ID}#${ec2Deployment.codePipelineJobId}`,
			sk2: `${EntitySortType.CREATED_AT}#${date}`,
			entity: Entity.COIN,
			times: {
				createdAt: date
			},
			...ec2Deployment
		}));
	}

}
