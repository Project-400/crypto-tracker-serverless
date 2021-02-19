import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { KlineValues, VALUE_LOG_INTERVAL, WalletValue } from '@crypto-tracker/common-types';
import moment from 'moment';

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

		const alreadyExists: boolean = await this.logWalletValuation(userId, totalValue, roundedMinute, VALUE_LOG_INTERVAL.MINUTE);

		if (alreadyExists) return;

		if (roundedMinute.endsWith(':00:00.000Z')) {
			console.log('CREATE HOUR KV');
			const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
			await this.updatePreviousKlineValues(userId, totalValue, previousHour, VALUE_LOG_INTERVAL.HOUR);
			await this.createHourKlineValues(userId, totalValue, roundedHour);
		} else {
			console.log('UPDATE HOUR KV');
			await this.updateWalletValuationKlineValues(userId, totalValue, roundedHour, VALUE_LOG_INTERVAL.HOUR);
		}

		if (roundedMinute.endsWith('T00:00:00.000Z')) {
			console.log('CREATE DAY KV');
			const previousDay: string = moment(roundedDay).subtract(24, 'hours').toISOString();
			await this.updatePreviousKlineValues(userId, totalValue, previousDay, VALUE_LOG_INTERVAL.DAY);
			await this.createDayKlineValues(userId, totalValue, roundedDay);
		} else {
			console.log('UPDATE DAY KV');

			await this.updateWalletValuationKlineValues(userId, totalValue, roundedDay, VALUE_LOG_INTERVAL.DAY);
		}
	}

	public createHourKlineValues = async (userId: string, totalValue: string, roundedHour: string): Promise<void> => {
		await this.unitOfWork.KlineValues.create(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
	}

	public createDayKlineValues = async (userId: string, totalValue: string, roundedDay: string): Promise<void> => {
		await this.unitOfWork.KlineValues.create(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY);
	}

	public updatePreviousKlineValues = async (userId: string, totalValue: string, previousTime: string, interval: VALUE_LOG_INTERVAL):
		Promise<void> => {
		const klineValues: Partial<KlineValues> = await this.unitOfWork.KlineValues.get(userId, interval, previousTime);

		if (klineValues) {
			klineValues.lastValue = totalValue;
			klineValues.close = totalValue;
			klineValues.isClosed = true;

			await this.unitOfWork.KlineValues.update(userId, klineValues);
		}
	}

	public logWalletValuation = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL): Promise<boolean> => {
		const walletValue: Partial<WalletValue> = {
			value: totalValue,
			time,
			interval
		};

		const walletValuation: WalletValue = await this.unitOfWork.WalletValuation.get(userId, interval, time);

		if (!walletValuation) {
			await this.unitOfWork.WalletValuation.create(userId, walletValue);
			return false;
		}
		return true; // Log for this time already exists
	}

	public updateWalletValuationKlineValues = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL):
		Promise<void> => {
		const klineValues: Partial<KlineValues> = await this.unitOfWork.KlineValues.get(userId, interval, time);

		if (klineValues) {
			if (totalValue > klineValues.highest) klineValues.highest = totalValue;
			if (totalValue < klineValues.lowest) klineValues.lowest = totalValue;

			klineValues.lastValue = totalValue;
			klineValues.updateCount = klineValues.updateCount ? klineValues.updateCount + 1 : 1;
			const change: number = Number(klineValues.lastValue) - Number(klineValues.open);
			klineValues.change = change.toString();
			klineValues.changePercentage = ((change / Number(klineValues.open)) * 100).toFixed(4);

			await this.unitOfWork.KlineValues.update(userId, klineValues);
		} else { // Kline doesn't exist for whatever reason - Possibly due to previous timeout or deployment. Fallback: Create new
			console.log(`NO ${interval} KV: ${time}`);
			if (interval === VALUE_LOG_INTERVAL.HOUR) await this.createHourKlineValues(userId, totalValue, time);
			if (interval === VALUE_LOG_INTERVAL.DAY) await this.createDayKlineValues(userId, totalValue, time);
		}
	}

}
