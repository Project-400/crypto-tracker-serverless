import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { Coin } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

export class CoinsService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getAllCoins = async (userId: string): Promise<Coin[]> => {
		const coins: Coin[] = await this.unitOfWork.Coins.getAllCoins(userId);

		return coins.filter((c: Coin) => c.free > 0).sort((a: Coin, b: Coin) => {
			if (a.free < b.free) return 1;
			if (a.free > b.free) return -1;
			return 0;
		});
	}

	public getSpecifiedCoins = async (userId: string, coinNames: string[]): Promise<Coin[]> => {
		const coins: Coin[] = await this.unitOfWork.Coins.getSpecifiedCoins(userId, coinNames);

		return coins.filter((c: Coin) => c.free > 0).sort((a: Coin, b: Coin) => {
			if (a.free < b.free) return 1;
			if (a.free > b.free) return -1;
			return 0;
		});
	}

	public gatherUserCoins = async (userId: string): Promise<number> => {
		const coins: Coin[] = await BinanceApi.GetAllCoins();

		await Promise.all(coins.map((coin: Coin) => this.unitOfWork.Coins.create(userId, coin)));

		return coins.length;
	}

}
