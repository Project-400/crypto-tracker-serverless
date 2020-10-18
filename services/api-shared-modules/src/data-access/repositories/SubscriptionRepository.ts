import { QueryOptions, QueryIterator } from '@aws/dynamodb-data-mapper';
import { Repository } from './Repository';
import { QueryKey, ISubscriptionRepository } from '../interfaces';
import { SubscriptionItem } from '../../models/core';
import { Subscription } from '../../types';
import { Entity } from '../../types/entities';
import {
	beginsWith,
	BeginsWithPredicate,
	ConditionExpression,
	EqualityExpressionPredicate,
	equals
} from '@aws/dynamodb-expressions';
import { EntitySortType } from '../../types/entity-sort-types';
import { DBIndex } from '../../types/db-indexes';

export class SubscriptionRepository extends Repository implements ISubscriptionRepository {

	public async getAll(): Promise<Subscription[]> {
		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getAllByType(subscriptionId: string, itemType: string, itemId: string): Promise<Subscription[]> {
		const predicate: BeginsWithPredicate = beginsWith(`${Entity.SUBSCRIPTION}#${subscriptionId}`);

		const equalsExpression: ConditionExpression = {
			...predicate,
			subject: 'pk'
		};

		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk: `${itemType}#${itemId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK,
			filter: equalsExpression
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getAllByUser(userId: string): Promise<Subscription[]> {
		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk3: `${Entity.USER}#${userId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK3
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getAllByDeviceConnection(connectionId: string, deviceId: string): Promise<Subscription[]> {
		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk2: `${EntitySortType.DEVICE}#${deviceId}/${EntitySortType.CONNECTION}#${connectionId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK2
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getAllByConnection(connectionId: string): Promise<Subscription[]> {
		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk2: `/${EntitySortType.CONNECTION}#${connectionId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK2
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getAllByDevice(deviceId: string): Promise<Subscription[]> {
		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk2: beginsWith(`${EntitySortType.DEVICE}#${deviceId}`)
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK2
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getByType(subscriptionId: string, connectionId: string, userId: string): Promise<Subscription[]> {
		const predicate: EqualityExpressionPredicate = equals(`${Entity.SUBSCRIPTION}#${subscriptionId}/${EntitySortType.CONNECTION}#${connectionId}`);

		const beginsExpression: ConditionExpression = {
			...predicate,
			subject: 'pk'
		};

		const keyCondition: QueryKey = {
			entity: Entity.SUBSCRIPTION,
			sk3: `${Entity.USER}#${userId}`
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK3,
			filter: beginsExpression
		};

		const queryIterator: QueryIterator<SubscriptionItem> = this.db.query(SubscriptionItem, keyCondition, queryOptions);
		const subscriptions: Subscription[] = [];

		for await (const sub of queryIterator) subscriptions.push(sub);

		return subscriptions;
	}

	public async getById(subscriptionId: string, itemType: string, itemId: string, connectionId: string): Promise<Subscription> {
		try {
			return await this.db.get(Object.assign(new SubscriptionItem(), {
				pk: `${Entity.SUBSCRIPTION}#${subscriptionId}/${EntitySortType.CONNECTION}#${connectionId}`,
				sk: `${itemType}#${itemId}`
			}));
		} catch (err) {
			return undefined;
		}
	}

	public async create(subscriptionId: string, itemType: string,
		itemId: string, connectionId: string, deviceId: string, userId?: string): Promise<Subscription> {
		return this.db.put(Object.assign(new SubscriptionItem(), {
			entity: Entity.SUBSCRIPTION,
			pk: `${Entity.SUBSCRIPTION}#${subscriptionId}/${EntitySortType.CONNECTION}#${connectionId}`,
			sk: `${itemType}#${itemId}`,
			sk2: deviceId ? `${EntitySortType.DEVICE}#${deviceId}/${EntitySortType.CONNECTION}#${connectionId}` : `${EntitySortType.CONNECTION}#${connectionId}`,
			sk3: userId ? `${Entity.USER}#${userId}` : undefined,
			connectionId,
			deviceId,
			subscriptionId,
			itemType,
			itemId,
			times: {
				subscribedAt: new Date().toISOString()
			}
		}));
	}

	public async update(subscriptionId: string, itemType: string, itemId: string, connectionId: string, changes: Partial<Subscription>):
		Promise<Subscription> {
		return this.db.update(Object.assign(new SubscriptionItem(), {
			pk: `${Entity.SUBSCRIPTION}#${subscriptionId}/${EntitySortType.CONNECTION}#${connectionId}`,
			sk: `${itemType}#${itemId}`,
			...changes
		}), {
			onMissing: 'skip'
		});
	}

	public async delete(subscriptionId: string, itemType: string, itemId: string, connectionId: string): Promise<Subscription | undefined> {
		try {
			const sub: SubscriptionItem = await this.db.delete(Object.assign(new SubscriptionItem(), {
				pk: `${Entity.SUBSCRIPTION}#${subscriptionId}/${EntitySortType.CONNECTION}#${connectionId}`,
				sk: `${itemType}#${itemId}`
			}), {
				returnValues: 'NONE'
			});

			return sub;
		} catch (err) {
			return undefined;
		}
	}
}
