import { BaseFunctionExpressionPredicate, BetweenExpressionPredicate, BinaryComparisonPredicate, ConditionExpression } from '@aws/dynamodb-expressions';

export { IUserRepository } from './IUserRepository';
export { ISubscriptionRepository } from './ISubscriptionRepository';
export { ICoinRepository } from './ICoinRepository';
export { IPriceBatchRepository } from './IPriceBatchRepository';
export { IPriceChangeStatsRepository } from './IPriceChangeStatsRepository';
export { IExchangePairRepository } from './IExchangePairRepository';
export { ITransactionRepository } from './ITransactionRepository';
export { IExchangeInfoRepository } from './IExchangeInfoRepository';
export { ITraderBotRepository } from './ITraderBotRepository';
export { ITraderBotLogDataRepository } from './ITraderBotLogDataRepository';
export { IWalletValuationRepository } from './IWalletValuationRepository';
export { IKlineValuesRepository } from './IKlineValuesRepository';

export interface QueryKey {
	pk?: string;
	sk?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression | BetweenExpressionPredicate;
	sk2?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression | BetweenExpressionPredicate;
	sk3?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression;
	entity?: string;
}
