import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { User, UserConnection, UserType } from '../../types';

export class UserItem extends DynamoDbItem implements User {

	@attribute()
	public userId!: string;

	@attribute()
	public email!: string;

	@attribute()
	public firstName!: string;

	@attribute()
	public lastName!: string;

	@attribute()
	public userType!: UserType;

	@attribute()
	public avatar?: string;

	@attribute()
	public confirmed!: boolean;

	@attribute()
	public times: {
		confirmedAt?: string;
		createdAt: Date | string;
		lastLogin?: Date | string;
	};

	@attribute()
	public connections: UserConnection[];

}
