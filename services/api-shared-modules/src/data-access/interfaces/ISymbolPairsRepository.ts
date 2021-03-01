import { SymbolPairs } from '@crypto-tracker/common-types';

export interface ISymbolPairsRepository {
	create(pair: { [symbol: string]: string[] }): Promise<SymbolPairs>;
	get(): Promise<SymbolPairs>;
}
