import {
	UserRepository,
	SubscriptionRepository,
	CoinRepository,
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository,
	ICoinRepository,
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public Coins: ICoinRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
		this.Subscriptions = new SubscriptionRepository(db);
		this.Coins = new CoinRepository(db);
	}

}
