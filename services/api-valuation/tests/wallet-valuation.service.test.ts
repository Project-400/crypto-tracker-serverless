import { WalletValuationService } from '../src/wallet-valuation.service';
import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import {
	KlineValues_CreateNewDay,
	KlineValues_CreateNewHour,
	KlineValues_GetExistingDay,
	KlineValues_GetExistingHour, KlineValues_GetPreviousDay, KlineValues_GetPreviousHour,
	KlineValues_UpdateExistingDay,
	KlineValues_UpdateExistingHour, KlineValues_UpdatePreviousDay, KlineValues_UpdatePreviousHour,
	WalletValuation_CreateNewMinuteLog,
	WalletValuation_GetExistingMinuteLog
} from './mocks';
import { when } from 'jest-when';
import { VALUE_LOG_INTERVAL, WalletValuation } from '@crypto-tracker/common-types';
import Mock = jest.Mock;
import { DatetimeUtils } from '../../api-shared-modules/src/utils/datetime';
import * as moment from 'moment';

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

	test('Unhappy Path: It should find an existing WalletValuation log and do nothing', async (done: jest.DoneCallback): Promise<void> => {
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

	test('Happy Path: It should create a new WalletValuation, update Hour & Day KlineValues (after the rounded hour mark)',
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
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingHour));
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingDay));
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(0);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

	test('(Un?)happy Path: It should create a new WalletValuation, find no Hour & Day KlineValues (after the rounded hour mark)',
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
			.mockReturnValue(undefined);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(undefined);

		when(mockFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		when(mockFunctions.createKlineValues)
			.calledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY)
			.mockReturnValue(KlineValues_CreateNewDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, roundedHour);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY);
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(0);

		done();
	});

	test('Happy Path: It should create a new WalletValuation, create Hour Kline & update Day KlineValues (on the rounded hour mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockFunctions.floorMinute.mockReturnValue('2021-02-19T11:00:00.000Z'); // Rounded minute mark
		mockFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockFunctions.floorMinute();
		const roundedHour: string = mockFunctions.floorHour();
		const roundedDay: string = mockFunctions.floorDay();
		const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
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
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour)
			.mockReturnValue(KlineValues_GetPreviousHour);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetExistingDay)
			.mockReturnValue(KlineValues_UpdateExistingDay);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousHour)
			.mockReturnValue(KlineValues_UpdatePreviousHour);

		when(mockFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining(KlineValues_GetExistingDay));
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining({
			updateCount: 2,
			lastValue: totalValue,
			close: totalValue,
			isClosed: true,
			change: '20',
			changePercentage: '20.0000'
		}));
		expect(mockFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(1);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

	test('Happy Path: It should create a new WalletValuation, create Hour Kline & create Day KlineValues (on the rounded day mark)',
		async (done: jest.DoneCallback): Promise<void> => {
		const mockedUnitOfWork: UnitOfWork = new MockedUnitOfWork();
		const mockedDatetimeUtils: DatetimeUtils = new MockedDatetimeUtils();
		const walletValuationService: WalletValuationService = new WalletValuationService(mockedUnitOfWork, mockedDatetimeUtils);
		const userId: string = 'test_user_id';
		const totalValue: string = '120';
		mockFunctions.floorMinute.mockReturnValue('2021-02-19T00:00:00.000Z'); // Rounded minute mark
		mockFunctions.floorHour.mockReturnValue('2021-02-19T11:00:00.000Z');
		mockFunctions.floorDay.mockReturnValue('2021-02-19T00:00:00.000Z');
		const roundedMinute: string = mockFunctions.floorMinute();
		const roundedHour: string = mockFunctions.floorHour();
		const roundedDay: string = mockFunctions.floorDay();
		const previousHour: string = moment(roundedHour).subtract(1, 'hour').toISOString();
		const previousDay: string = moment(roundedDay).subtract(24, 'hours').toISOString();
			console.log('PREVIOUS DAY');
			console.log(previousDay);
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
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, roundedDay)
			.mockReturnValue(KlineValues_GetExistingDay);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour)
			.mockReturnValue(KlineValues_GetPreviousHour);

		when(mockFunctions.getKlineValues)
			.calledWith(userId, VALUE_LOG_INTERVAL.DAY, previousDay)
			.mockReturnValue(KlineValues_GetPreviousDay);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousHour)
			.mockReturnValue(KlineValues_UpdatePreviousHour);

		when(mockFunctions.updateKlineValues)
			.calledWith(userId, KlineValues_GetPreviousDay)
			.mockReturnValue(KlineValues_UpdatePreviousDay);

		when(mockFunctions.createKlineValues)
			.calledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR)
			.mockReturnValue(KlineValues_CreateNewHour);

		when(mockFunctions.createKlineValues)
			.calledWith(userId, roundedDay, totalValue, VALUE_LOG_INTERVAL.DAY)
			.mockReturnValue(KlineValues_CreateNewDay);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(mockFunctions.getWalletValuation).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.MINUTE, roundedMinute);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledWith(userId, walletValuation);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.HOUR, previousHour);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledWith(userId, VALUE_LOG_INTERVAL.DAY, previousDay);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledWith(userId, expect.objectContaining({
			updateCount: 2,
			lastValue: totalValue,
			close: totalValue,
			isClosed: true,
			change: '20',
			changePercentage: '20.0000'
		}));
		expect(mockFunctions.createKlineValues).toHaveBeenCalledWith(userId, roundedHour, totalValue, VALUE_LOG_INTERVAL.HOUR);
		expect(mockFunctions.getWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.createWalletValuation).toHaveBeenCalledTimes(1);
		expect(mockFunctions.getKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.createKlineValues).toHaveBeenCalledTimes(2);
		expect(mockFunctions.updateKlineValues).toHaveBeenCalledTimes(2);

		done();
	});

});
