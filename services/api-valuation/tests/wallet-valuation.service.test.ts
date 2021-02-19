import { WalletValuationService } from '../src/wallet-valuation.service';
import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { WalletValuation_GetExistingMinuteLog } from './mocks';
import { when } from 'jest-when';
import { VALUE_LOG_INTERVAL } from '@crypto-tracker/common-types';
import Mock = jest.Mock;
import DateTimeFunctions from '../../api-shared-modules/src/utils/datetime';

const mockFunctions: any = {
	getWalletValuation: jest.fn(),
	createWalletValuation: jest.fn(),
	getKlineValues: jest.fn(),
	createKlineValues: jest.fn(),
	updateKlineValues: jest.fn()
};

const MockedUnitOfWork: Mock = jest.fn().mockImplementation(() =>
	({
		WalletValuation: {
			get: mockFunctions.getWalletValuation,
			create: mockFunctions.createWalletValuation
		},
		KlineValues: {
			get: mockFunctions.getKlineValues,
			create: mockFunctions.createKlineValues,
			update: mockFunctions.updateKlineValues
		}
	}));

describe('Test Bot Service', (): void => {

	beforeEach(() => {
		MockedUnitOfWork.mockClear();
	});

	test('It should find an existing WalletValuation log and do nothing', async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork);
		const userId: string = 'fake_user_id';
		const totalValue: string = '10000';
		const interval: VALUE_LOG_INTERVAL = VALUE_LOG_INTERVAL.MINUTE;
		const roundedMinute: string = DateTimeFunctions.FloorMinute;

		when(mockFunctions.getWalletValuation)
			.calledWith(userId, interval, roundedMinute)
			.mockReturnValue(WalletValuation_GetExistingMinuteLog);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(0);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(0);
		done();
	});
	//
	// test('It should find no existing WalletValuation, create a new one and create Hour & Day KlineValues',
	// 	async (done: jest.DoneCallback): Promise<void> => {
	// 	const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
	// 	const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork);
	// 	const userId: string = 'fake_user_id';
	// 	const totalValue: string = '10000';
	//
	// 	mockFunctions.getWalletValuation().mockReturnValueOnce(undefined);
	//
	// 	await walletValuationService.performValueLogging(userId, totalValue);
	//
	// 		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
	// 		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
	// 		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(0);
	// 		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(0);
	// 		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(0);
	// 	done();
	// });

});
