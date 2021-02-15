import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { WalletValuation, WalletValue } from '@crypto-tracker/common-types';

export class WalletValuationService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public logWalletValuation = async (userId: string, totalValue: string): Promise<void> => {
		const minuteMillis: number = 1000 * 60;
		const hourMillis: number = 1000 * 60 * 60;
		const date: Date = new Date();
		const roundedMinute: string = new Date(Math.floor(date.getTime() / minuteMillis) * minuteMillis).toISOString();
		const roundedHour: string = new Date(Math.floor(date.getTime() / hourMillis) * hourMillis).toISOString();
		const walletValue: WalletValue = {
			value: totalValue,
			time: roundedMinute
		};

		const walletValuation: WalletValuation = await this.unitOfWork.WalletValuation.get(userId, roundedHour);

		if (walletValuation) {
			walletValuation.values.push(walletValue);
			await this.unitOfWork.WalletValuation.update(roundedHour, userId, walletValuation);
		} else {
			await this.unitOfWork.WalletValuation.create(userId, roundedHour, roundedMinute, walletValue);
		}
	}

}
