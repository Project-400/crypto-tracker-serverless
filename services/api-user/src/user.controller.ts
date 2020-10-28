import {
	ResponseBuilder,
	ErrorCode,
	ApiResponse,
	ApiHandler,
	ApiEvent,
	ApiContext,
	LastEvaluatedKey,
	User
} from '../../api-shared-modules/src';
import { UserService } from './user.service';
import { GetAllUsersResponse } from './user.interfaces';

export class UserController {

	public constructor(private userService: UserService) { }

	public getAllUsers: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		let lastEvaluatedKey: LastEvaluatedKey;
		if (event.body) lastEvaluatedKey = JSON.parse(event.body) as LastEvaluatedKey;

		try {
			const result: GetAllUsersResponse = await this.userService.getAllUsers(lastEvaluatedKey);

			return ResponseBuilder.ok({ ...result, count: result.users.length });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public getUserById: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.pathParameters || !event.pathParameters.userId) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request parameters');
		const userId: string = event.pathParameters.userId;

		try {
			const user: User = await this.userService.getUserById(userId);

			return ResponseBuilder.ok({ user });
		} catch (err) {
			if (err.name === 'ItemNotFoundException') return ResponseBuilder.notFound(ErrorCode.GeneralError, 'User not found');
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

	public updateUser: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		if (!event.body) return ResponseBuilder.badRequest(ErrorCode.BadRequest, 'Invalid request body');

		const user: Partial<User> = JSON.parse(event.body) as Partial<User>;
		const cognitoIdentity: string =
			event.requestContext &&
			event.requestContext.identity &&
			event.requestContext.identity.cognitoAuthenticationProvider;

		try {
			const result: User = await this.userService.updateUser(cognitoIdentity, user);

			return ResponseBuilder.ok({ user: result });
		} catch (err) {
			return ResponseBuilder.internalServerError(err, err.message);
		}
	}

}
