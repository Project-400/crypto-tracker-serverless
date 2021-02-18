import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { KlineValues, VALUE_LOG_INTERVAL, WalletValue } from '@crypto-tracker/common-types';

export class WalletValuationService {

	public constructor(private unitOfWork: UnitOfWork) { }

	// public getWalletValuationLogs = async (userId: string, interval: VALUE_LOG_INTERVAL, count: number): Promise<WalletValuation[]> => {
	// 	if (interval === VALUE_LOG_INTERVAL.MINUTE) {
	// 		const millis: number = 1000 * 60;
	//
	// 	}
	// 	const logs: WalletValuation[] = await this.unitOfWork.WalletValuation.getRange(userId, '', ''); // Attempt to get details from DB
	//
	// 	return logs;
	// }

	public performValueLogging = async (userId: string, totalValue: string): Promise<void> => {
		const minuteMillis: number = 1000 * 60;
		const hourMillis: number = minuteMillis * 60;
		const dayMillis: number = hourMillis * 24;
		const date: Date = new Date();
		const roundedMinute: string = new Date(Math.floor(date.getTime() / minuteMillis) * minuteMillis).toISOString();
		const roundedHour: string = new Date(Math.floor(date.getTime() / hourMillis) * hourMillis).toISOString();
		const roundedDay: string = new Date(Math.floor(date.getTime() / dayMillis) * dayMillis).toISOString();

		await this.logWalletValuation(userId, totalValue, roundedMinute, VALUE_LOG_INTERVAL.MINUTE);

		if (roundedMinute.endsWith(':00:00.000Z')) {
			console.log('CREATE HOUR KV');
			await this.createHourKlineValues(userId, totalValue, roundedHour);
		} else {
			console.log('UPDATE HOUR KV');
			await this.updateWalletValuationKlineValues(userId, totalValue, roundedHour, VALUE_LOG_INTERVAL.HOUR);
		}

		if (roundedMinute.endsWith('T00:00:00.000Z')) {
			console.log('CREATE DAY KV');
			await this.createDayKlineValues(userId, totalValue, roundedDay);
		} else {
			console.log('UPDATE DAY KV');

			await this.updateWalletValuationKlineValues(userId, totalValue, roundedDay, VALUE_LOG_INTERVAL.DAY);
		}
	}

	public createHourKlineValues = async (userId: string, totalValue: string, roundedHour: string): Promise<void> => {
		const klineValues: Partial<KlineValues> = {
			time: roundedHour,
			open: totalValue,
			lowest: totalValue,
			highest: totalValue,
			average: totalValue,
			interval: VALUE_LOG_INTERVAL.HOUR
		};
		await this.unitOfWork.KlineValues.create(userId, klineValues);
	}

	public createDayKlineValues = async (userId: string, totalValue: string, roundedDay: string): Promise<void> => {
		const klineValues: Partial<KlineValues> = {
			time: roundedDay,
			open: totalValue,
			lowest: totalValue,
			highest: totalValue,
			average: totalValue,
			interval: VALUE_LOG_INTERVAL.DAY
		};
		await this.unitOfWork.KlineValues.create(userId, klineValues);	}

	public logWalletValuation = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL): Promise<void> => {
		const walletValue: Partial<WalletValue> = {
			value: totalValue,
			time,
			interval
		};

		const walletValuation: WalletValue = await this.unitOfWork.WalletValuation.get(userId, interval, time);

		if (!walletValuation) await this.unitOfWork.WalletValuation.create(userId, walletValue);
	}

	public updateWalletValuationKlineValues = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL):
		Promise<void> => {
		const klineValues: Partial<KlineValues> = await this.unitOfWork.KlineValues.get(userId, interval, time);

		if (klineValues) {
			if (totalValue > klineValues.highest) klineValues.highest = totalValue;
			if (totalValue < klineValues.lowest) klineValues.lowest = totalValue;

			await this.unitOfWork.KlineValues.update(userId, klineValues);
		} else { // Kline doesn't exist for whatever reason - Possibly due to previous timeout or deployment. Fallback: Create new
			console.log(`NO ${interval} KV: ${time}`);
			if (interval === VALUE_LOG_INTERVAL.HOUR) await this.createHourKlineValues(userId, totalValue, time);
			if (interval === VALUE_LOG_INTERVAL.DAY) await this.createDayKlineValues(userId, totalValue, time);
		}
	}

}
