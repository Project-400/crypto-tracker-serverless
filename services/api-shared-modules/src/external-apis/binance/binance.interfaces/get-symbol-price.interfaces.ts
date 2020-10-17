import { PairPrice } from '../../../types';

export interface GetSymbolPriceDto extends PairPrice { }

export interface GetAllSymbolPricesDto extends Array<GetSymbolPriceDto> { }
