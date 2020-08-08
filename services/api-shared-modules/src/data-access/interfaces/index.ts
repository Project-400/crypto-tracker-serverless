import { BaseFunctionExpressionPredicate, BetweenExpressionPredicate, BinaryComparisonPredicate, ConditionExpression } from '@aws/dynamodb-expressions';

export { IUserRepository } from './IUserRepository';
export { ISubscriptionRepository } from './ISubscriptionRepository';

export interface QueryKey {
	pk?: string;
	sk?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression | BetweenExpressionPredicate;
	sk2?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression | BetweenExpressionPredicate;
	sk3?: string | BinaryComparisonPredicate | BaseFunctionExpressionPredicate | ConditionExpression;
	entity?: string;
}
