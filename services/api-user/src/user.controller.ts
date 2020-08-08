import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	UnitOfWork,
	SharedFunctions,
	UserItem,
	LastEvaluatedKey,
	User
} from '../../api-shared-modules/src';

export class UserController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getAllUsers: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) {
			const { pk, sk, sk2, entity}: LastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;
			lastEvaluatedKey = {
				pk,
				sk,
				sk2,
				entity
			};
		}
		try {
			const result: { users: User[]; lastEvaluatedKey: Partial<UserItem> } = await this.unitOfWork.Users.getAll(lastEvaluatedKey);
			if (!result) return ResponseBuilder.notFound(ErrorCode.GeneralError, 'Failed to retrieve Users');

			return ResponseBuilder.ok({ ...result, count: result.users.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getUserById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const userId: string = event.pathParameters.userId;

		try {

			const user: User = await this.unitOfWork.Users.getById(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			return ResponseBuilder.ok({ user });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const user: Partial<User> = JSON.parse(event.body) as Partial<User>;

		try {
			const userId: string = SharedFunctions.getUserIdFromAuthProvider(event.requestContext.identity.cognitoAuthenticationProvider);
			const result: User = await this.unitOfWork.Users.update(userId, { ...user });
			if (!result) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public deleteUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');

		const userId: string = event.pathParameters.userId;

		try {
			const user: User = await this.unitOfWork.Users.delete(userId);
			if (!user) return ResponseBuilder.notFound(ErrorCode.InvalidId, 'User not found');

			return ResponseBuilder.ok({ user });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
