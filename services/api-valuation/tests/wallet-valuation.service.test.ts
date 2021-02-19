import { WalletValuationService } from '../src/wallet-valuation.service';
import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import {
	KlineValues_GetExistingDay,
	KlineValues_GetExistingHour,
	KlineValues_UpdateExistingDay,
	KlineValues_UpdateExistingHour,
	WalletValuation_CreateNewMinuteLog,
	WalletValuation_GetExistingMinuteLog
} from './mocks';
import { when } from 'jest-when';
import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import Mock = jest.Mock;
import { DatetimeUtils } from '../../api-shared-modules/src/utils/datetime';

const mockFunctions: any = {
	getWalletValuation: jest.fn(),
	createWalletValuation: jest.fn(),
	getKlineValues: jest.fn(),
	createKlineValues: jest.fn(),
	updateKlineValues: jest.fn(),

	floorMinute: jest.fn(),
	floorHour: jest.fn(),
	floorDay: jest.fn()
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

const MockedDatetimeUtils: Mock = jest.fn().mockImplementation(() =>
	({
		FloorMinute: mockFunctions.floorMinute,
		FloorHour: mockFunctions.floorHour,
		FloorDay: mockFunctions.floorDay
	}));

describe('Test Wallet Valuation Service', (): void => {

	beforeEach(() => {
		MockedUnitOfWork.mockClear();
		jest.clearAllMocks();
	});

	test('It should find an existing WalletValuation log and do nothing', async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '10000';
		const interval: VALUE_LOG_INTERVAL = VALUE_LOG_INTERVAL.MINUTE;

		mockFunctions.floorMinute.mockReturnValue('2021-02-19T11:16:00.000Z');

		const roundedMinute: string = mockFunctions.floorMinute();

		when(mockFunctions.getWalletValuation)
			.calledWith(userId, interval, roundedMinute)
			.mockReturnValue(WalletValuation_GetExistingMinuteLog);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(0);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(0);

		done();
	});

	test('It should find no existing WalletValuation, create a new one and update Hour & Day KlineValues',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockFunctions.floorMinute.mockReturnValue('2021-02-19T11:16:00.000Z');
		mockFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockFunctions.floorMinute();
		const roundedHour: string = mockFunctions.floorHour();
		const roundedDay: string = mockFunctions.floorDay();
		const walletValuation: Partial<WalletValuation> = {
			value: totalValue,
			time: roundedMinute,
			interval: VALUE_LOG_INTERVAL.MINUTE
		};

		when(mockFunctions.getWalletValuation)
			.calledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute)
			.mockReturnValue(undefined);

		when(mockFunctions.createWalletValuation)
			.calledWith(userId, walletValuation)
			.mockReturnValue(WalletValuation_CreateNewMinuteLog);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour)
			.mockReturnValue(KlineValues_GetExistingHour);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingHour)
			.mockReturnValue(KlineValues_UpdateExistingHour);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingDay)
			.mockReturnValue(KlineValues_UpdateExistingDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, KlineValues_GetExistingHour);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, KlineValues_GetExistingDay);
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

});