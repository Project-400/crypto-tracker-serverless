import {
	UserRepository,
	SubscriptionRepository,
	CoinRepository,
	PriceBatchRepository,
	ExchangePairRepository,
	TransactionRepository,
	ExchangeInfoRepository,
	TraderBotRepository,
	TraderBotLogDataRepository,
	PriceChangeStatsRepository,
	WalletValuationRepository,
	KlineValuesRepository
} from './repositories';
import {
	IUserRepository,
	ISubscriptionRepository,
	ICoinRepository,
	IPriceBatchRepository,
	IExchangePairRepository,
	ITransactionRepository,
	IExchangeInfoRepository,
	ITraderBotRepository,
	ITraderBotLogDataRepository,
	IPriceChangeStatsRepository,
	IWalletValuationRepository,
	IKlineValuesRepository
} from './interfaces';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { DynamoDB } from 'aws-sdk';

export class UnitOfWork {

	public Users: IUserRepository;
	public Subscriptions: ISubscriptionRepository;
	public Coins: ICoinRepository;
	public PriceBatches: IPriceBatchRepository;
	public PriceChangeStats: IPriceChangeStatsRepository;
	public ExchangePairs: IExchangePairRepository;
	public ExchangeInfo: IExchangeInfoRepository;
	public Transactions: ITransactionRepository;
	public TraderBotLogData: ITraderBotLogDataRepository;
	public TraderBot: ITraderBotRepository;
	public WalletValuation: IWalletValuationRepository;
	public KlineValues: IKlineValuesRepository;

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
		this.TraderBotLogData = new TraderBotLogDataRepository(db);
		this.TraderBot = new TraderBotRepository(db);
		this.WalletValuation = new WalletValuationRepository(db);
		this.KlineValues = new KlineValuesRepository(db);
	}

}
