import { UnitOfWork } from '../../api-shared-modules/src/data-access';
import { LastEvaluatedKey, User } from '../../api-shared-modules/src/types';
import { GetAllUsersResponse } from './user.interfaces';
import { SharedFunctions } from '../../api-shared-modules/src/utils';

export class UserService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getAllUsers = async (lastEvaluatedKey: LastEvaluatedKey): Promise<GetAllUsersResponse> => {
		const result: GetAllUsersResponse = await this.unitOfWork.Users.getAll(lastEvaluatedKey);
		if (!result) throw Error('Failed to retrieve Users');

		return result;
	}

	public getUserById = async (userId: string): Promise<User> => {
		const user: User = await this.unitOfWork.Users.getById(userId);
		if (!user) throw Error('User not found');

		return user;
	}

	public updateUser = async (cognitoIdentity: string, user: Partial<User>): Promise<User> => {
		const userId: string = SharedFunctions.getUserIdFromAuthProvider(cognitoIdentity); // Will this still work without Amplify?
		const result: User = await this.unitOfWork.Users.update(userId, { ...user });
		if (!result) throw Error('User not found');

		return result;
	}

}
