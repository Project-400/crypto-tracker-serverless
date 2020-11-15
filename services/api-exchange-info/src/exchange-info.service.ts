import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import DateTimeFunctions from '../../api-shared-modules/src/utils/datetime';
import { GatherAllExchangeInfoCounts } from './exchange-info.interfaces';

export class ExchangeInfoService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangeInfo = async (): Promise<GatherAllExchangeInfoCounts> => {				// Run by admin or cron job only
		const info: ExchangeInfoSymbol[] = await this.requestExchangeInfo();
		let newCount: number = 0;
		let updatedCount: number = 0;

		await Promise.all(info.map(async (i: ExchangeInfoSymbol) => {
			try {
				const existingInfo: ExchangeInfoSymbol = await this.unitOfWork.ExchangeInfo.get(i.symbol);

				await this.unitOfWork.ExchangeInfo.update({ ...existingInfo, ...i });
				updatedCount += 1;
			} catch (err) {
				if (err.name === 'ItemNotFoundException') {
					await this.unitOfWork.ExchangeInfo.create(i);
					newCount += 1;
				} else {
					console.error(`An error occurred when retrieving Exchange Info from DB`);
				}
			}
		}));

		return { total: info.length, newCount, updatedCount };
	}

	public getSymbolExchangeInfo = async (symbol: string): Promise<ExchangeInfoSymbol> => {
		let info: ExchangeInfoSymbol;

		try {
			info = await this.unitOfWork.ExchangeInfo.get(symbol); // Attempt to get details from DB

			if (DateTimeFunctions.IsWithinHours(3, info.times.updatedAt)) { // Info may be outdated - Update saved details
				console.log(`Exchange Info for ${symbol} is outdated. Pulling latest data from Binance`);
				info = await this.updateSingleExchangeInfo(info);
			}
		} catch (err) { // Doesn't exist in the DB - Make request to Binance
			console.error(`An error occurred when attempting to retrieve Exchange Info for ${symbol} from DB: ${err}`);

			if (err.name === 'ItemNotFoundException') {
				console.log('Failed to find Exchnage info in DB - Retrieving from Binance');
				info = await this.saveSingleExchangeInfo(symbol);
			}
		}

		return info;
	}

	private saveSingleExchangeInfo = async (symbol: string): Promise<ExchangeInfoSymbol> => {
		const allInfo: Array<Partial<ExchangeInfoSymbol>> = await this.requestExchangeInfo();

		const newInfo: Partial<ExchangeInfoSymbol> = allInfo.find((s: ExchangeInfoSymbol) => s.symbol === symbol);
		if (!newInfo) throw Error(`${symbol} symbol exchange info not found`);

		return this.unitOfWork.ExchangeInfo.create(newInfo);
	}

	private updateSingleExchangeInfo = async (info: ExchangeInfoSymbol): Promise<ExchangeInfoSymbol> => {
		const allInfo: Array<Partial<ExchangeInfoSymbol>> = await this.requestExchangeInfo();

		const newInfo: Partial<ExchangeInfoSymbol> = allInfo.find((s: ExchangeInfoSymbol) => s.symbol === info.symbol);
		if (!newInfo) throw Error(`${info.symbol} symbol exchange info not found`);

		const updatedInfo: ExchangeInfoSymbol = { ...info, ...newInfo };

		return this.unitOfWork.ExchangeInfo.update(updatedInfo);
	}

	private requestExchangeInfo = async (): Promise<ExchangeInfoSymbol[]> => {
		const info: GetExchangeInfoDto = await BinanceApi.GetExchangeInfo();
		return info.symbols;
	}

}
