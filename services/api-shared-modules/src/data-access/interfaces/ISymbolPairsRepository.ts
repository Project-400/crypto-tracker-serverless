import { SymbolPairs } from '@crypto-tracker/common-types';

export interface ISymbolPairsRepository {
	create(pair: Partial<SymbolPairs>): Promise<SymbolPairs>;
	get(): Promise<SymbolPairs>;
}
