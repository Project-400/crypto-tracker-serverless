import { ApiContext, ApiEvent, ApiHandler, ApiResponse, ErrorCode, ResponseBuilder, UnitOfWork, } from '../../api-shared-modules/src';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
import AWS from 'aws-sdk';
import Auth, { TokenVerification } from '../../_auth/verify';
import { BotType, ITraderBot, TradingBotState } from '../../api-shared-modules/src/models/core/TraderBot';

export class BotsController {

	public constructor(private unitOfWork: UnitOfWork) { }


	public getTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.queryStringParameters || !event.queryStringParameters.botId || !event.queryStringParameters.createdAt)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const botId: string = event.queryStringParameters.botId;
		const createdAt: string = event.queryStringParameters.createdAt;

		try {
			const bot: ITraderBot = await this.unitOfWork.TraderBot.getTraderBot(userId, botId, createdAt);

			return ResponseBuilder.ok({ bot });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public createTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { symbol: string } = JSON.parse(event.body);
		const symbol: string = data.symbol;

		// TODO: Check symbol exists on Binance

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const bot: Partial<ITraderBot> = {
			userId,
			symbol,
			botType: BotType.SHORT_TERM,
			botState: TradingBotState.WAITING
		};

		try {
			const result: ITraderBot = await this.unitOfWork.TraderBot.createBot(userId, bot);

			// TODO: Implement call to bot service

			return ResponseBuilder.ok({ bot: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public stopTraderBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: { botId: string, createdAt: string } = JSON.parse(event.body);
		const botId: string = data.botId;
		const createdAt: string = data.createdAt;

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const bot: ITraderBot = await this.unitOfWork.TraderBot.getTraderBot(userId, botId, createdAt);

			bot.botState = TradingBotState.FINISHING;
			bot.times.stoppingAt = new Date().toISOString();

			const result: ITraderBot = await this.unitOfWork.TraderBot.updateBot(userId, bot);

			// TODO: Implement call to bot service

			return ResponseBuilder.ok({ bot: result });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Trader Bot not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public saveTradeBotData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: ISymbolTraderData = JSON.parse(event.body).tradeData;

		await this.unitOfWork.BotTradeData.createTradeBotData(data);

		try {
			return ResponseBuilder.ok({ saved: true });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public testPublish: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const sns: any = new AWS.SNS();

		console.log('Publishing data to topic');
		await sns.publish({
			Message: 'Test publish to SNS from Lambda',
			TopicArn: 'arn:aws:sns:eu-west-1:068475715603:TestTopic'
		}, async (err: any, data: any) => {
			if (err) {
				console.log(err.stack);
				return;
			}
			console.log('push sent');
			console.log(data);
			context.done(undefined, 'Function Finished!');
		}).promise();

		console.log('Finishing publishing');

		try {
			return ResponseBuilder.ok({ published: true });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
