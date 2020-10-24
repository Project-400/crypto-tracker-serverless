import { Repository } from './Repository';
import { ITraderBotRepository, QueryKey } from '../interfaces';
import { v4 as uuid } from 'uuid';
import { Entity } from '../../types/entities';
import { EntitySortType } from '../../types/entity-sort-types';
import { ITraderBot, TraderBotItem, TradingBotState } from '../../models/core/TraderBot';
import { QueryIterator, QueryOptions } from '@aws/dynamodb-data-mapper';
import { DBIndex } from '../../types/db-indexes';
import { beginsWith, inList, MembershipExpressionPredicate, ConditionExpression } from '@aws/dynamodb-expressions';

export class TraderBotRepository extends Repository implements ITraderBotRepository {

	public async get(userId: string, botId: string, createdAt: string): Promise<ITraderBot> {
		return this.db.get(Object.assign(new TraderBotItem(), {
			pk: this.pk(botId),
			sk: this.sk(userId, createdAt)
		}));
	}

	public async getAll(): Promise<ITraderBot[]> {
		const keyCondition: QueryKey = {
			entity: Entity.TRADER_BOT
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK
		};

		const queryIterator: QueryIterator<TraderBotItem> = this.db.query(TraderBotItem, keyCondition, queryOptions);
		const bots: ITraderBot[] = [];

		for await (const bot of queryIterator) bots.push(bot);

		return bots;
	}

	public async getAllByUser(userId: string, states?: string[]): Promise<ITraderBot[]> {
		const predicate: MembershipExpressionPredicate = inList(...states);

		const expression: ConditionExpression = {
			...predicate,
			subject: 'botState'
		};

		const keyCondition: QueryKey = {
			entity: Entity.TRADER_BOT,
			sk: beginsWith(`${Entity.USER}#${userId}`)
		};

		const queryOptions: QueryOptions = {
			indexName: DBIndex.SK,
			filter: expression
		};

		const queryIterator: QueryIterator<TraderBotItem> = this.db.query(TraderBotItem, keyCondition, queryOptions);
		const bots: ITraderBot[] = [];

		for await (const bot of queryIterator) bots.push(bot);

		return bots;
	}

	public async create(userId: string, bot: Partial<ITraderBot>): Promise<ITraderBot> {
		const botId: string = uuid();
		const date: string = new Date().toISOString();

		bot.times = {
			createdAt: date
		};

		return this.db.put(Object.assign(new TraderBotItem(), {
			pk: this.pk(botId),
			sk: this.sk(userId, date),
			sk2: this.sk2(date), // This can be replaced. Probably not needed to sort globally by createdAt
			sk3: this.sk3(bot.botType),
			entity: Entity.TRADER_BOT,
			botId,
			...bot
		}));
	}

	public async update(userId: string, bot: ITraderBot): Promise<ITraderBot> {
		delete bot.sk2;
		delete bot.sk3;

		bot.times.updatedAt = new Date().toISOString();

		return this.db.update(Object.assign(new TraderBotItem(), {
			pk: bot.pk,
			sk: bot.sk,
			...bot
		}), {
			onMissing: 'skip'
		});
	}

	private pk = (botId: string): string => `${Entity.TRADER_BOT}#${botId}`;
	private sk = (userId: string, createdAt: string): string => `${Entity.USER}#${userId}/${EntitySortType.CREATED_AT}#${createdAt}`;
	private sk2 = (createdAt: string): string => `${EntitySortType.CREATED_AT}#${createdAt}`;
	private sk3 = (botType: string): string => `${EntitySortType.BOT_TYPE}#${botType}`;

}
