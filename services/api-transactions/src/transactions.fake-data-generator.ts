import {
	BinanceOrderStatus,
	BinanceTimeInForce,
	BinanceTransactionSide,
	BinanceTransactionType,
	ExchangeCurrencyTransactionFull
} from '@crypto-tracker/common-types';
import BinanceApi from '../../api-shared-modules/src/external-apis/binance/binance';
import { GetSymbolPriceDto } from '../../api-shared-modules/src/external-apis/binance/binance.interfaces';

export class TransactionsFakeDataGenerator {

	public static GenerateFakeBuyTransaction = async (symbol: string, quoteQty: number, baseAsset: string):
		Promise<ExchangeCurrencyTransactionFull> => {
		const date: number = new Date().getTime();
		const orderId: number = date;
		const priceDto: GetSymbolPriceDto = await BinanceApi.GetSymbolPrice(symbol);
		const price: number = Number(priceDto.price);
		const baseQty: number = quoteQty / price;
		const commission: string = (baseQty * 0.1).toString(); // 0.1% commission

		return {
			symbol,
			orderId,
			orderListId: -1,
			clientOrderId: 'fake-client-buy-order-id-' + date,
			transactTime: date,
			price: '0.00000000',
			origQty: baseQty.toString(),
			executedQty: baseQty.toString(),
			cummulativeQuoteQty: quoteQty.toString(),
			status: BinanceOrderStatus.FILLED,
			timeInForce: BinanceTimeInForce.GTC,
			type: BinanceTransactionType.MARKET,
			side: BinanceTransactionSide.BUY,
			fills: [
				{
					price: price.toString(),
					qty: baseQty.toString(),
					commission,
					commissionAsset: baseAsset,
					tradeId: 123456
				}
			]
		};
	}

	public static GenerateFakeSellTransaction = async (symbol: string, quoteQty: number, baseAsset: string):
		Promise<ExchangeCurrencyTransactionFull> => {
		const date: number = new Date().getTime();
		const orderId: number = date;
		const priceDto: GetSymbolPriceDto = await BinanceApi.GetSymbolPrice(symbol);
		const price: number = Number(priceDto.price);
		const baseQty: number = quoteQty / price;
		const commission: string = (baseQty * 0.1).toString(); // 0.1% commission

		return {
			symbol,
			orderId,
			orderListId: -1,
			clientOrderId: 'fake-client-sell-order-id-' + date,
			transactTime: date,
			price: '0.00000000',
			origQty: baseQty.toString(),
			executedQty: baseQty.toString(),
			cummulativeQuoteQty: quoteQty.toString(),
			status: BinanceOrderStatus.FILLED,
			timeInForce: BinanceTimeInForce.GTC,
			type: BinanceTransactionType.MARKET,
			side: BinanceTransactionSide.BUY,
			fills: [
				{
					price: price.toString(),
					qty: baseQty.toString(),
					commission,
					commissionAsset: baseAsset,
					tradeId: 123456
				}
			]
		};
	}

}
