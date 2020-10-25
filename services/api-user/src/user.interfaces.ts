import { User } from '../../api-shared-modules/src/types';
import { UserItem } from '../../api-shared-modules/src/models/core';

export interface GetAllUsersResponse {
	users: User[];
	lastEvaluatedKey: Partial<UserItem>;
}
