import {
	UnitOfWork,
	TriggerCognitoEvent,
	TriggerCognitoHandler,
	User
} from '../../api-shared-modules/src';

export class AuthController {

	public constructor(private unitOfWork: UnitOfWork) { }

	public postSignUp: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		const cognitoUser: { [key: string]: string } = event.request.userAttributes;
		const user: Partial<User> = {
			email : cognitoUser.email,
			confirmed: false
		};

		try {
			user.userType = 'User';
			user.firstName = cognitoUser.given_name;
			user.lastName = cognitoUser.family_name;

			await this.unitOfWork.Users.createAfterSignUp(cognitoUser.sub, { ...user });

			return event;
		} catch (err) {
			return err;
		}
	}

	public preSignUp: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		// Perform any pre-sign-up checks
		try {
			return event;
		} catch (err) {
			return err;
		}
	}

	public postConfirmation: TriggerCognitoHandler = async (event: TriggerCognitoEvent) => {
		const cognitoUser: { [key: string]: string } = event.request.userAttributes;

		const user: User = await this.unitOfWork.Users.getById(cognitoUser.sub);
		user.confirmed = true;
		user.times.confirmedAt = new Date().toISOString();

		try {
			await this.unitOfWork.Users.update(cognitoUser.sub, { ...user });

			return event;
		} catch (err) {
			return err;
		}
	}
}
