import { BOT_SERVICE_API_VERSION } from '../../../../../environment/env';
import * as qs from 'qs';

export default class BotServiceEndpoints {

	public static RequestEndpoint = (endpoint: BotServiceEndpoint, data?: any): string => {
		const stringifiedData: string = data && BotServiceEndpoints.StringifyData(data);

		switch (endpoint) {
			case BotServiceEndpoint.DEPLOY_BOT:
				return BotServiceEndpoints.DeployBot(stringifiedData);
			case BotServiceEndpoint.STOP_BOT:
				return BotServiceEndpoints.StopBot(stringifiedData);
			case BotServiceEndpoint.GET_BOT:
				return BotServiceEndpoints.GetBot(stringifiedData);
			case BotServiceEndpoint.GET_ALL_BOTS:
				return BotServiceEndpoints.GetAllBots();
			case BotServiceEndpoint.SHUTDOWN_ALL_BOTS:
				return BotServiceEndpoints.ShutdownAllBots();
			case BotServiceEndpoint.HEALTH_CHECK:
				return BotServiceEndpoints.HealthCheck();
			default:
				return BotServiceEndpoints.HealthCheck();
		}
	}

	private static StringifyData = (data: any): string => qs.stringify(data);

	private static DeployBot = (data: string): string => `${BOT_SERVICE_API_VERSION}/trader-bot`;

	private static StopBot = (data: string): string => `${BOT_SERVICE_API_VERSION}/trader-bot/stop`;

	private static GetBot = (botId: string): string => `${BOT_SERVICE_API_VERSION}/trader-bot?botId=${botId}`;

	private static GetAllBots = (): string => `${BOT_SERVICE_API_VERSION}/trader-bot/all`;

	private static ShutdownAllBots = (): string => `${BOT_SERVICE_API_VERSION}/trader-bot/shutdown-all`;

	private static HealthCheck = (): string => `${BOT_SERVICE_API_VERSION}/health`;

}

export enum BotServiceEndpoint {
	DEPLOY_BOT,
	STOP_BOT,
	GET_BOT,
	GET_ALL_BOTS,
	SHUTDOWN_ALL_BOTS,
	HEALTH_CHECK
}
