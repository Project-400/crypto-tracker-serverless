import Mock = jest.Mock;

export const mockWalletValuationFunctions: any = {
	getWalletValuation: jest.fn(),
	createWalletValuation: jest.fn()
};

export const mockKlineValuesFunctions: any = {
	getKlineValues: jest.fn(),
	createKlineValues: jest.fn(),
	updateKlineValues: jest.fn()
};

export const MockedUnitOfWork: Mock = jest.fn().mockImplementation(() =>
	({
		WalletValuation: {
			get: mockWalletValuationFunctions.getWalletValuation,
			create: mockWalletValuationFunctions.createWalletValuation
		},
		KlineValues: {
			get: mockKlineValuesFunctions.getKlineValues,
			create: mockKlineValuesFunctions.createKlineValues,
			update: mockKlineValuesFunctions.updateKlineValues
		}
	}));
