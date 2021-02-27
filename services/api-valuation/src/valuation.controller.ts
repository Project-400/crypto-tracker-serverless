import { ApiContext, ApiEvent, ApiHandler, ApiResponse, ErrorCode, ResponseBuilder } from '../../api-shared-modules/src';
import Auth, { TokenVerification } from '../../_auth/verify';
import { CoinCount, ValuationService } from './valuation.service';
import { CoinsService } from '../../api-coins/src/coins.service';
import { Coin } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import { WalletValuationService } from './wallet-valuation.service';
import { KlineValues, VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types';

export class ValuationController {

	public constructor(
		private valuationService: ValuationService,
		private coinsService: CoinsService,
		private walletValuationService: WalletValuationService
	) { }

	public retrieveValuationLog: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.time)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			console.log(event.pathParameters.time);
			const log: any =
				await this.walletValuationService.getWalletValuation(userId, VALUE_LOG_INTERVAL.MINUTE, event.pathParameters.time);

			if (log && log.values) {
				await Promise.all(log.values.map(async (value: any) => {
					await this.walletValuationService.logWalletValuation(userId, value.value, value.time, VALUE_LOG_INTERVAL.MINUTE);
				}));
			}

			console.log(log);
			return ResponseBuilder.ok({ log });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getValuation: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.coins)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		const coinNames: string[] = event.pathParameters.coins.split(',');

		try {
			const coinCounts: CoinCount[] = (await this.coinsService.getSpecifiedCoins(userId, coinNames))
				.map((c: Coin) => ({
					coin: c.coin,
					coinCount: c.free
				}));

			const values: CoinCount[] = await this.valuationService.getValuation(coinCounts);
			const totalValue: string = this.valuationService.calculateValueTotal(values);

			return ResponseBuilder.ok({ values, totalValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getValuationForAllCoins: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const { values, totalValue }: { values: CoinCount[]; totalValue: string } = await this.getValuationForAllWalletCoins(userId);

			return ResponseBuilder.ok({ values, totalValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getWalletKlineValues: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.limit || !event.pathParameters.interval)
			return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const limit: number = Number(event.pathParameters.limit);
			const interval: VALUE_LOG_INTERVAL = VALUE_LOG_INTERVAL[event.pathParameters.interval.toUpperCase()];

			const klines: KlineValues[] = await this.walletValuationService.getWalletValuations(userId, interval, limit);

			return ResponseBuilder.ok({ klines });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public logWalletValue: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		const auth: TokenVerification = Auth.VerifyToken('');
		const userId: string = auth.sub;

		try {
			const { totalValue }: { totalValue: string } = await this.getValuationForAllWalletCoins(userId);

			await this.walletValuationService.performValueLogging(userId, totalValue);

			console.log(`CURRENT WALLET TOTAL: ${totalValue} at ${new Date().toISOString()}`);

			return ResponseBuilder.ok({ totalValue });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	private getValuationForAllWalletCoins = async (userId: string): Promise<{ values: CoinCount[]; totalValue: string }> => {
		const coinCounts: CoinCount[] = (await this.coinsService.getAllCoins(userId))
			.map((c: Coin) => ({
				coin: c.coin,
				coinCount: c.free
			}));

		const values: CoinCount[] = await this.valuationService.getValuation(coinCounts);
		const totalValue: string = this.valuationService.calculateValueTotal(values);

		return { values, totalValue };
	}

}
