import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { ExchangeInfoSymbol } from '@crypto-tracker/common-types';
import { GetExchangeInfoDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces/get-exchange-info.interfaces';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';

export class ExchangeInfoService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public gatherAllExchangeInfo = async (): Promise<number> => {
		const info: ExchangeInfoSymbol[] = await this.requestExchangeInfo();

		// TODO: Check currently saved Exchange Info objects in DB and only save new ones (possibly udpate old ones)

		await Promise.all(info.map((i: ExchangeInfoSymbol) => this.unitOfWork.ExchangeInfo.saveExchangeInfo(i)));

		return info.length;
	}

	public getSymbolExchangeInfo = async (symbol: string, quote: string): Promise<ExchangeInfoSymbol> => {
		let info: ExchangeInfoSymbol;

		try {
			info = await this.unitOfWork.ExchangeInfo.getExchangeInfo(symbol, quote); // Attempt to get details from DB
		} catch (err) { // Doesn't exist in the DB - Make request to Binance
			const allInfo: Array<Partial<ExchangeInfoSymbol>> = await this.requestExchangeInfo();

			const newInfo: Partial<ExchangeInfoSymbol> = allInfo.find((s: ExchangeInfoSymbol) => s.symbol === symbol);
			if (!newInfo) throw Error(`${symbol} symbol exchange info not found`);

			info = await this.unitOfWork.ExchangeInfo.saveExchangeInfo(newInfo);
		}

		return info;
	}

	public requestExchangeInfo = async (): Promise<ExchangeInfoSymbol[]> => {
		const info: GetExchangeInfoDto = await BinanceApi.GetExchangeInfo();
		return info.symbols;
	}

}
