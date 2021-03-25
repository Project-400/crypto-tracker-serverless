import { Repository } from './Repository';
import { Entity } from '../../types/entities';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';
import { Ec2InstanceDeploymentItem } from '../../models/core';
import { EntitySortType } from '../../types/entity-sort-types';
import { IEc2DeploymentsRepository, QueryKey } from '../interfaces';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { ConditionExpression, EqualityExpressionPredicate, equals } from '@aws/dynamodb-expressions';

export class Ec2DeploymentsRepository extends Repository implements IEc2DeploymentsRepository {

	public async get(appName: string, codePipelineJobId: string): Promise<Ec2InstanceDeployment> {
		const predicate: EqualityExpressionPredicate = equals(appName);

		const equalsExpression: ConditionExpression = {
			...predicate,
			subject: 'appName'
		};

		const keyCondition: QueryKey = {
			entity: Entity.EC2_INSTANCE_DEPLOYMENT
		};

		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
			filter: equalsExpression,
			scanIndexForward: false,
			limit: 1
		};

		const queryIterator: QueryIterator<Ec2InstanceDeployment> = this.db.query(Ec2InstanceDeploymentItem, keyCondition, queryOptions);
		const deployments: Ec2InstanceDeployment[] = [];

		for await (const dep of queryIterator) deployments.push(dep);

		return deployments[0];
	}

	public async create(ec2Deployment: Partial<Ec2InstanceDeployment>): Promise<Ec2InstanceDeployment> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new Ec2InstanceDeploymentItem(), {
			pk: `${Entity.EC2_INSTANCE_DEPLOYMENT}#${ec2Deployment.appName}`,
			sk: `${EntitySortType.PIPELINE_JOB_ID}#${ec2Deployment.codePipelineJobId}`,
			sk2: `${EntitySortType.CREATED_AT}#${date}`,
			entity: Entity.EC2_INSTANCE_DEPLOYMENT,
			times: {
				createdAt: date
			},
			...ec2Deployment
		}));
	}

}
