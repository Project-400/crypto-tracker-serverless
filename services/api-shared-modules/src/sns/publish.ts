import { ApiContext, ApiEvent, ApiHandler, ApiResponse } from '../types';
import AWS from 'aws-sdk';
import { ResponseBuilder } from '../utils';

export class SNSPublisher {

	/*
	*
	* This was originally setup within one of the services as an endpoint.
	* This will need to be changed when it is being used - event and context not needed.
	*
	* */

	public publish: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
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
