import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork, ErrorCode,
} from '../../api-shared-modules/src';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
import AWS from 'aws-sdk';
import Auth, { TokenVerification } from '../../_auth/verify';
import { BotType, ITraderBot } from '../../api-shared-modules/src/models/core/TraderBot';

export class BotsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public createBot: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');
		if (!event.pathParameters || !event.pathParameters.symbol)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;
		const symbol: string = event.pathParameters.symbol;

		const bot: Partial<ITraderBot> = {
			userId,
			symbol,
			botType: BotType.SHORT_TERM
		};

		await this.unitOfWork.TraderBot.createBot(userId, bot);

		// TODO: Implement call to bot service

		try {
			return ResponseBuilder.ok({ bot });
		} catch (err) {
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
