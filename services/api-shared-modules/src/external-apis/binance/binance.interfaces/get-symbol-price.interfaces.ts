import { PairPrice } from '../../../types';

export interface GetSymbolPriceDto extends PairPrice {
	code?: number;
	msg?: string;
}

export interface GetAllSymbolPricesDto extends Array<GetSymbolPriceDto> { }
