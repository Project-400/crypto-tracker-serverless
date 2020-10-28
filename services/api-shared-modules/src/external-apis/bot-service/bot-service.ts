import BotServiceEndpoints, { BotServiceEndpoint } from './bot-service.endpoints';
import { HttpApi } from '../http-api';
import { BOT_SERVICE_API_HOST } from '../../../../../environment/env';

export default class BotServiceApi {

	public static async DeployTraderBot(botId: string): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.DEPLOY_BOT, { botId });

		return JSON.parse(await HttpApi.post(url, BOT_SERVICE_API_HOST, false));
	}

	public static async StopTraderBot(botId: string): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.STOP_BOT, { botId });

		return JSON.parse(await HttpApi.put(url, BOT_SERVICE_API_HOST, false));
	}

	public static async GetTraderBot(botId: string): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.STOP_BOT, { botId });

		return JSON.parse(await HttpApi.get(url));
	}

	public static async GetAllTraderBots(): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.GET_ALL_BOTS);

		return JSON.parse(await HttpApi.get(url));
	}

	public static async ShutdownAllTraderBots(): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.SHUTDOWN_ALL_BOTS);

		return JSON.parse(await HttpApi.put(url, BOT_SERVICE_API_HOST, false));
	}

	public static async HealthCheck(): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.HEALTH_CHECK);

		return JSON.parse(await HttpApi.get(url));
	}

}
