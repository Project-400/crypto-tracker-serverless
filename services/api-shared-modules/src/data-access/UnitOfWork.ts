import {
	UserRepository,
	SubscriptionRepository,
	CoinRepository, PriceBatchRepository, ExchangePairRepository, TransactionRepository, ExchangeInfoRepository, BotRepository,
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository,
	ICoinRepository, IPriceBatchRepository, IExchangePairRepository, ITransactionRepository, IExchangeInfoRepository, IBotRepository,
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';
import { IPriceChangeStatsRepository } from './interfaces/IPriceChangeStatsRepository';
import { PriceChangeStatsRepository } from './repositories/PriceChangeStatsRepository';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public Coins: ICoinRepository;
	public PriceBatches: IPriceBatchRepository;
	public PriceChangeStats: IPriceChangeStatsRepository;
	public ExchangePairs: IExchangePairRepository;
	public ExchangeInfo: IExchangeInfoRepository;
	public Transactions: ITransactionRepository;
	public BotTradeData: IBotRepository;

	public constructor() {
		const db: DataMapper = new DataMapper({ client: new DynamoDB({ region: 'eu-west-1' }) });

		this.Users = new UserRepository(db);
		this.Subscriptions = new SubscriptionRepository(db);
		this.Coins = new CoinRepository(db);
		this.PriceBatches = new PriceBatchRepository(db);
		this.PriceChangeStats = new PriceChangeStatsRepository(db);
		this.ExchangePairs = new ExchangePairRepository(db);
		this.ExchangeInfo = new ExchangeInfoRepository(db);
		this.Transactions = new TransactionRepository(db);
		this.BotTradeData = new BotRepository(db);
	}

}
