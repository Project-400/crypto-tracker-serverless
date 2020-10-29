import BotServiceEndpoints, { BotServiceEndpoint } from './bot-service.endpoints';
import { HttpApi } from '../http-api';
import { BOT_SERVICE_API_HOST } from '../../../../../environment/env';

export default class BotServiceApi {

	private static headers: any = {
		'Content-Type': 'application/json'
	};

	public static async DeployTraderBot(botId: string): Promise<any> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.DEPLOY_BOT);

		return HttpApi.post(url, BOT_SERVICE_API_HOST, 3000, BotServiceApi.headers, { botId });
	}

	public static async StopTraderBot(botId: string): Promise<any> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.STOP_BOT);

		return HttpApi.put(url, BOT_SERVICE_API_HOST, 3000, BotServiceApi.headers, { botId });
	}

	public static async PauseTraderBot(botId: string): Promise<any> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.PAUSE_BOT);

		return HttpApi.put(url, BOT_SERVICE_API_HOST, 3000, BotServiceApi.headers, { botId });
	}

	public static async GetTraderBot(botId: string): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.STOP_BOT, { botId });

		return JSON.parse(await HttpApi.get(url));
	}

	public static async GetAllTraderBots(): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.GET_ALL_BOTS);

		return JSON.parse(await HttpApi.get(url));
	}

	public static async ShutdownAllTraderBots(): Promise<any> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.SHUTDOWN_ALL_BOTS);

		return HttpApi.put(url, BOT_SERVICE_API_HOST, 3000, BotServiceApi.headers);
	}

	public static async HealthCheck(): Promise<void> {
		const url: string = BotServiceEndpoints.RequestEndpoint(BotServiceEndpoint.HEALTH_CHECK);

		return JSON.parse(await HttpApi.get(url));
	}

}
