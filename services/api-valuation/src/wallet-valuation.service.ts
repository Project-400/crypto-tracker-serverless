import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { KlineValues, VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import * as moment from 'moment';
import { DatetimeUtils } from '../../api-shared-modules/src/utils/datetime';

export class WalletValuationService {

	public constructor(
		private unitOfWork: UnitOfWork,
		private datetimeFunctions: DatetimeUtils
		) { }

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
		const roundedMinute: string = this.datetimeFunctions.FloorMinute();
		const roundedHour: string = this.datetimeFunctions.FloorHour();
		const roundedDay: string = this.datetimeFunctions.FloorDay();

		const alreadyExists: boolean = await this.logWalletValuation(userId, totalValue, roundedMinute, VALUE_LOG_INTERVAL.MINUTE);

		if (alreadyExists) return;

		if (roundedMinute.endsWith(':00:00.000Z')) {
			const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
			await this.updatePreviousKlineValues(userId, totalValue, previousHour, VALUE_LOG_INTERVAL.HOUR);
			const created: KlineValues = await this.createHourKlineValues(userId, totalValue, roundedHour);
			if (!created) throw Error(`New Hour KlineValues was not created for user: ${userId} - time: ${roundedHour} - interval: ${VALUE_LOG_INTERVAL.HOUR}`);
		} else {
			await this.updateWalletValuationKlineValues(userId, totalValue, roundedHour, VALUE_LOG_INTERVAL.HOUR);
		}

		if (roundedMinute.endsWith('T00:00:00.000Z')) {
			const previousDay: string = moment(roundedDay).subtract(24, 'hours').toISOString();
			await this.updatePreviousKlineValues(userId, totalValue, previousDay, VALUE_LOG_INTERVAL.DAY);
			const created: KlineValues = await this.createDayKlineValues(userId, totalValue, roundedDay);
			if (!created) throw Error(`New Day KlineValues was not created for user: ${userId} - time: ${roundedDay} - interval: ${VALUE_LOG_INTERVAL.DAY}`);
		} else {
			await this.updateWalletValuationKlineValues(userId, totalValue, roundedDay, VALUE_LOG_INTERVAL.DAY);
		}
	}

	private createHourKlineValues = async (userId: string, totalValue: string, roundedHour: string): Promise<KlineValues> =>
		this.unitOfWork.KlineValues.create(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)

	private createDayKlineValues = async (userId: string, totalValue: string, roundedDay: string): Promise<KlineValues> =>
		this.unitOfWork.KlineValues.create(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY)

	private updatePreviousKlineValues = async (userId: string, totalValue: string, previousTime: string, interval: VALUE_LOG_INTERVAL):
		Promise<void> => {
		const klineValues: Partial<KlineValues> = await this.unitOfWork.KlineValues.get(userId, interval, previousTime);

		if (klineValues) {
			klineValues.lastValue = totalValue;
			klineValues.close = totalValue;
			klineValues.isClosed = true;
			klineValues.times.valueEndingAt = previousTime;
			klineValues.updateCount = klineValues.updateCount ? klineValues.updateCount + 1 : 1;
			const change: number = Number(klineValues.lastValue) - Number(klineValues.open);
			klineValues.change = change.toString();
			klineValues.changePercentage = ((change / Number(klineValues.open)) * 100).toFixed(4);

			const updated: KlineValues = await this.unitOfWork.KlineValues.update(userId, klineValues);

			if (!updated) throw Error(`Updating previous KlineValues failed for user: ${userId} - previous time: ${previousTime} - interval: ${interval}`);
		}
	}

	private logWalletValuation = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL): Promise<boolean> => {
		const walletValuation: WalletValuation = await this.unitOfWork.WalletValuation.get(userId, interval, time);

		if (!walletValuation) {
			const walletValue: Partial<WalletValuation> = {
				value: totalValue,
				time,
				interval
			};

			const newWalletValuation: WalletValuation = await this.unitOfWork.WalletValuation.create(userId, walletValue);
			if (!newWalletValuation) throw Error(`WalletValuation was not created for user: ${userId} - time: ${time} - interval: ${interval}`);
			return false;
		}
		return true; // Log for this time already exists
	}

	private updateWalletValuationKlineValues = async (userId: string, totalValue: string, time: string, interval: VALUE_LOG_INTERVAL):
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

			const updated: KlineValues = await this.unitOfWork.KlineValues.update(userId, klineValues);
			if (!updated) throw Error(`Updating KlineValues failed for user: ${userId} - time: ${time} - interval: ${interval}`);
		} else { // Kline doesn't exist for whatever reason - Possibly due to previous timeout or deployment. Fallback: Create new
			if (interval === VALUE_LOG_INTERVAL.HOUR) {
				const created: KlineValues = await this.createHourKlineValues(userId, totalValue, time);
				if (!created) {
					throw Error(`New Hour KlineValues (Past 00:00) was not created for user: ${userId} - time: ${time} - interval: ${interval}`);
				}
			} else if (interval === VALUE_LOG_INTERVAL.DAY) {
				const created: KlineValues = await this.createDayKlineValues(userId, totalValue, time);
				if (!created) {
					throw Error(`New Day KlineValues (Past 00:00) was not created for user: ${userId} - time: ${time} - interval: ${interval}`);
				}
			}
		}
	}

}
