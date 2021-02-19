import { WalletValuationService } from '../src/wallet-valuation.service';
import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import {
	KlineValues_CreateNewDay,
	KlineValues_CreateNewHour,
	KlineValues_GetExistingDay,
	KlineValues_GetExistingHour,
	KlineValues_GetPreviousDay,
	KlineValues_GetPreviousHour,
	KlineValues_UpdateExistingDay,
	KlineValues_UpdateExistingHour,
	KlineValues_UpdatePreviousDay,
	KlineValues_UpdatePreviousHour,
	WalletValuation_CreateNewMinuteLog,
	WalletValuation_GetExistingMinuteLog
} from '../mocks/wallet-valuation.service.mock';
import { when } from 'jest-when';
import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import { DatetimeUtils } from '../../api-shared-modules/src/utils/datetime';
import * as moment from 'moment';
import {
	MockedUnitOfWork,
	mockKlineValuesFunctions,
	mockWalletValuationFunctions
} from '../../api-shared-modules/src/data-access/mocks/UnitOfWork';
import Mock = jest.Mock;

const mockDatetimeUtilFunctions: any = {
	floorMinute: jest.fn(),
	floorHour: jest.fn(),
	floorDay: jest.fn()
};

const MockedDatetimeUtils: Mock = jest.fn().mockImplementation(() =>
	({
		FloorMinute: mockDatetimeUtilFunctions.floorMinute,
		FloorHour: mockDatetimeUtilFunctions.floorHour,
		FloorDay: mockDatetimeUtilFunctions.floorDay
	}));

describe('Test Wallet Valuation Service', (): void => {

	beforeEach(() => {
		MockedUnitOfWork.mockClear();
		jest.clearAllMocks();
	});

	test('Unhappy Path: It should find an existing WalletValuation log and do nothing', async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '10000';
		const interval: VALUE_LOG_INTERVAL = VALUE_LOG_INTERVAL.MINUTE;

		mockDatetimeUtilFunctions.floorMinute.mockReturnValue('2021-02-19T11:16:00.000Z');

		const roundedMinute: string = mockDatetimeUtilFunctions.floorMinute();

		when(mockWalletValuationFunctions.getWalletValuation)
			.calledWith(userId, interval, roundedMinute)
			.mockReturnValue(WalletValuation_GetExistingMinuteLog);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledTimes(0);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledTimes(0);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledTimes(0);

		done();
	});

	test('Happy Path: It should create a new WalletValuation, update Hour & Day KlineValues (after the rounded hour mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockDatetimeUtilFunctions.floorMinute.mockReturnValue('2021-02-19T11:16:00.000Z');
		mockDatetimeUtilFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockDatetimeUtilFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockDatetimeUtilFunctions.floorMinute();
		const roundedHour: string = mockDatetimeUtilFunctions.floorHour();
		const roundedDay: string = mockDatetimeUtilFunctions.floorDay();
		const walletValuation: Partial<WalletValuation> = {
			value: totalValue,
			time: roundedMinute,
			interval: VALUE_LOG_INTERVAL.MINUTE
		};

		when(mockWalletValuationFunctions.getWalletValuation)
			.calledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute)
			.mockReturnValue(undefined);

		when(mockWalletValuationFunctions.createWalletValuation)
			.calledWith(userId, walletValuation)
			.mockReturnValue(WalletValuation_CreateNewMinuteLog);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour)
			.mockReturnValue(KlineValues_GetExistingHour);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingHour)
			.mockReturnValue(KlineValues_UpdateExistingHour);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingDay)
			.mockReturnValue(KlineValues_UpdateExistingDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingHour));
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingDay));
		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

	test('(Un?)happy Path: It should create a new WalletValuation, find no Hour & Day KlineValues (after the rounded hour mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockDatetimeUtilFunctions.floorMinute.mockReturnValue('2021-02-19T11:16:00.000Z');
		mockDatetimeUtilFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockDatetimeUtilFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockDatetimeUtilFunctions.floorMinute();
		const roundedHour: string = mockDatetimeUtilFunctions.floorHour();
		const roundedDay: string = mockDatetimeUtilFunctions.floorDay();
		const walletValuation: Partial<WalletValuation> = {
			value: totalValue,
			time: roundedMinute,
			interval: VALUE_LOG_INTERVAL.MINUTE
		};

		when(mockWalletValuationFunctions.getWalletValuation)
			.calledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute)
			.mockReturnValue(undefined);

		when(mockWalletValuationFunctions.createWalletValuation)
			.calledWith(userId, walletValuation)
			.mockReturnValue(WalletValuation_CreateNewMinuteLog);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour)
			.mockReturnValue(undefined);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(undefined);

		when(mockKlineValuesFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		when(mockKlineValuesFunctions.createKlineValues)
			.calledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY)
			.mockReturnValue(KlineValues_CreateNewDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY);
		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledTimes(0);

		done();
	});

	test('Happy Path: It should create a new WalletValuation, create Hour Kline & update Day KlineValues (on the rounded hour mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockDatetimeUtilFunctions.floorMinute.mockReturnValue('2021-02-19T11:00:00.000Z'); // Rounded minute mark
		mockDatetimeUtilFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockDatetimeUtilFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockDatetimeUtilFunctions.floorMinute();
		const roundedHour: string = mockDatetimeUtilFunctions.floorHour();
		const roundedDay: string = mockDatetimeUtilFunctions.floorDay();
		const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
		const walletValuation: Partial<WalletValuation> = {
			value: totalValue,
			time: roundedMinute,
			interval: VALUE_LOG_INTERVAL.MINUTE
		};

		when(mockWalletValuationFunctions.getWalletValuation)
			.calledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute)
			.mockReturnValue(undefined);

		when(mockWalletValuationFunctions.createWalletValuation)
			.calledWith(userId, walletValuation)
			.mockReturnValue(WalletValuation_CreateNewMinuteLog);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour)
			.mockReturnValue(KlineValues_GetPreviousHour);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingDay)
			.mockReturnValue(KlineValues_UpdateExistingDay);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousHour)
			.mockReturnValue(KlineValues_UpdatePreviousHour);

		when(mockKlineValuesFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingDay));
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining({
			updateCount: 2,
			lastValue: totalValue,
			close: totalValue,
			isClosed: true,
			change: '20',
			changePercentage: '20.0000'
		}));
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledTimes(1);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

	test('Happy Path: It should create a new WalletValuation, create Hour Kline & create Day KlineValues (on the rounded day mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockDatetimeUtilFunctions.floorMinute.mockReturnValue('2021-02-19T00:00:00.000Z'); // Rounded minute mark
		mockDatetimeUtilFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockDatetimeUtilFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockDatetimeUtilFunctions.floorMinute();
		const roundedHour: string = mockDatetimeUtilFunctions.floorHour();
		const roundedDay: string = mockDatetimeUtilFunctions.floorDay();
		const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
		const previousDay: string = moment(roundedDay).subtract(24, 'hours').toISOString();
		const walletValuation: Partial<WalletValuation> = {
			value: totalValue,
			time: roundedMinute,
			interval: VALUE_LOG_INTERVAL.MINUTE
		};

		when(mockWalletValuationFunctions.getWalletValuation)
			.calledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute)
			.mockReturnValue(undefined);

		when(mockWalletValuationFunctions.createWalletValuation)
			.calledWith(userId, walletValuation)
			.mockReturnValue(WalletValuation_CreateNewMinuteLog);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour)
			.mockReturnValue(KlineValues_GetPreviousHour);

		when(mockKlineValuesFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, previousDay)
			.mockReturnValue(KlineValues_GetPreviousDay);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousHour)
			.mockReturnValue(KlineValues_UpdatePreviousHour);

		when(mockKlineValuesFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousDay)
			.mockReturnValue(KlineValues_UpdatePreviousDay);

		when(mockKlineValuesFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		when(mockKlineValuesFunctions.createKlineValues)
			.calledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY)
			.mockReturnValue(KlineValues_CreateNewDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, previousDay);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining({
			updateCount: 2,
			lastValue: totalValue,
			close: totalValue,
			isClosed: true,
			change: '20',
			changePercentage: '20.0000'
		}));
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockWalletValuationFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockWalletValuationFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockKlineValuesFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.createKlineValues).toHaveBeenCalledTimes(2);
		expect(mockKlineValuesFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

});
