import {
	ResponseBuilder,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork, ErrorCode,
} from '../../api-shared-modules/src';
import { ISymbolTraderData } from '@crypto-tracker/common-types';
// tslint:disable-next-line:no-require-imports no-var-requires typedef
const AWS: any = require('aws-sdk');

export class BotsController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public saveTradeBotData: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const data: ISymbolTraderData = JSON.parse(event.body).tradeData;

		await this.unitOfWork.BotTradeData.saveTradeBotData(data);

		try {
			return ResponseBuilder.ok({ saved: true });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public testPublish: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		console.log(event);
		console.log(context);

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
