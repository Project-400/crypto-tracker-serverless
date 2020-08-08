import { UserItem } from '../../models/core';
import { QueryOptions, QueryPaginator } from '@aws/dynamodb-data-mapper';
import { Repository } from './Repository';
import { QueryKey } from '../interfaces';
import { LastEvaluatedKey, User } from '../../types';

export class UserRepository extends Repository {

	public async getAll(lastEvaluatedKey?: LastEvaluatedKey): Promise<{ users: User[]; lastEvaluatedKey: Partial<UserItem> }> {
		// const predicate: MembershipExpressionPredicate = inList('User', 'Admin');
		//
		// const expression: ConditionExpression = {
		// 	...predicate,
		// 	subject: 'userType'
		// };

		const keyCondition: QueryKey = {
			entity: 'user'
		};
		const queryOptions: QueryOptions = {
			indexName: 'entity-sk2-index',
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
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}));
	}

	public async createAfterSignUp(userId: string, toCreate: Partial<User>): Promise<User> {
		const date: string = new Date().toISOString();

		return this.db.put(Object.assign(new UserItem(), {
			userId,
			pk: `user#${userId}`,
			sk: `user#${userId}`,
			entity: 'user',
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
			pk: `user#${userId}`,
			sk: `user#${userId}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(userId: string): Promise<User | undefined> {
		return this.db.delete(Object.assign(new UserItem(), {
			pk: `user#${userId}`,
			sk: `user#${userId}`
		}), {
			returnValues: 'ALL_OLD'
		});
	}
}
