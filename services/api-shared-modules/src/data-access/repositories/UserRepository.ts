import { UserItem } from '../../models/core';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { Repository } from './Repository';
import { QueryKey } from '../interfaces';
import { LastEvaluatedKey, User } from '../../types';
import { Entity } from '../../types/entities';
import { DBIndex } from '../../types/db-indexes';

export class UserRepository extends Repository {

	public async getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }> {
		// const predicate: MembershipExpressionPredicate = inList('User', 'Admin');
		//
		// const expression: ConditionExpression = {
		// 	...predicate,
		// 	subject: 'userType'
		// };

		const keyCondition: QueryKey = {
			entity: Entity.USER
		};
		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK2,
			scanIndexForward: false,
			startKey: lastEvaluatedKey,
			// filter: expression,
			limit: 10
		};

		const queryPages: QueryPaginator<UserItem> = this.db.query(UserItem, keyCondition, queryOptions).pages();
		const users: User[] = [];
		for await (const page of queryPages) {
			for (const user of page)
				users.push(user);
		}
		return {
			users,
			lastEvaluatedKey:
				queryPages.lastEvaluatedKey ?
					queryPages.lastEvaluatedKey :
					undefined
		};
	}

	public async getById(userId: string): Promise<User> {
		return this.db.get(Object.assign(new UserItem(), {
			pk: `${Entity.USER}#${userId}`,
			sk: `${Entity.USER}#${userId}`
		}));
	}

	public async createAfterSignUp(userId: string, toCreate: Partial<User>): Promise<User> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new UserItem(), {
			userId,
			pk: `${Entity.USER}#${userId}`,
			sk: `${Entity.USER}#${userId}`,
			entity: Entity.USER,
			confirmed: false,
			times: {
				createdAt: date
			},
			connections: [],
			...toCreate
		}));
	}

	public async update(userId: string, changes: Partial<User>): Promise<User> {
		delete changes.sk2;
		delete changes.sk3;

		return this.db.update(Object.assign(new UserItem(), {
			pk: `${Entity.USER}#${userId}`,
			sk: `${Entity.USER}#${userId}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(userId: string): Promise<User | undefined> {
		return this.db.delete(Object.assign(new UserItem(), {
			pk: `${Entity.USER}#${userId}`,
			sk: `${Entity.USER}#${userId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}
}
