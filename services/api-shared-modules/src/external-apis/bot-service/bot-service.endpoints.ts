import { BOT_SERVICE_API_DOMAIN } from '../../../../../environment/env';

export default class BotServiceEndpoints {

	public static DeployBot = (): string => `${BOT_SERVICE_API_DOMAIN}/trader-bot`;

	public static StopBot = (): string => `${BOT_SERVICE_API_DOMAIN}/trader-bot/stop`;

	public static GetBot = (botId: string): string => `${BOT_SERVICE_API_DOMAIN}/trader-bot?botId=${botId}`;

	public static GetAllBots = (): string => `${BOT_SERVICE_API_DOMAIN}/trader-bot/all`;

	public static ShutdownAllBots = (): string => `${BOT_SERVICE_API_DOMAIN}/trader-bot/shutdown-all`;

	public static HealthCheck = (): string => `${BOT_SERVICE_API_DOMAIN}/health`;

}

export enum BotServiceEndpoint {
	DEPLOY_BOT,
	STOP_BOT,
	GET_BOT,
	GET_ALL_BOTS,
	SHUTDOWN_ALL_BOTS
}
