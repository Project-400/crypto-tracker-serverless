import * as AWS from 'aws-sdk';
import { PostToConnectionRequest } from 'aws-sdk/clients/apigatewaymanagementapi';
import { WEBSOCKET_ENDPOINT } from '../../../../environment/env';
import { WsPostResult } from '../../../api-shared-modules/src';
import { SubscriptionData } from '../pubsub/subscription';
import { SubscriptionError, SubscriptionNotificationPayload, SubscriptionPayload } from '../../../api-shared-modules/src/types/websockets';

export default class API {

	private APIManager: AWS.ApiGatewayManagementApi =
		new AWS.ApiGatewayManagementApi({
			apiVersion: '2018-11-29',
			endpoint: WEBSOCKET_ENDPOINT
		}
	);

	public post = async (
		subscriptionData: SubscriptionData,
		data: SubscriptionPayload | SubscriptionError | SubscriptionNotificationPayload | { connectionId: string; userId: string }
	): Promise<WsPostResult> => {
		const params: PostToConnectionRequest = {
			ConnectionId: subscriptionData.connectionId,
			Data: JSON.stringify(data)
		};

		const res: WsPostResult =
			await this.APIManager
				.postToConnection(params)
				.promise()
				.catch((e: Error) => {
					console.log(e);
					// User has possibly disconnected without the $disconnect firing
					// await this.subManager.unsubscribe(subscriptionData);
				});

		return res;
	}

}
