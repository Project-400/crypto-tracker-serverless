import { WalletValuationService } from '../src/wallet-valuation.service';
import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import Mock = jest.Mock;
import { WalletValuation_GetExistingMinuteLog } from './mocks';

const get: Mock = jest.fn();
const create: Mock = jest.fn();
const MockedUnitOfWork: Mock = jest.fn().mockImplementation(() =>
	({
		WalletValuation: {
			get,
			create
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

		get.mockReturnValueOnce(WalletValuation_GetExistingMinuteLog);

		await walletValuationService.performValueLogging(userId, totalValue);

		expect(get).toHaveBeenCalledTimes(1);
		expect(create).toHaveBeenCalledTimes(0);
		done();
	});
});
