export class SharedFunctions {

	public static getUserIdFromAuthProvider = (authProvider: string): string => {
		if (!process.env.IS_OFFLINE && !authProvider) throw Error('No Auth Provider');

		const parts: string[] = authProvider.split(':');
		const userId: string = parts[parts.length - 1];

		if (!userId) throw Error('Unauthorised action');
		return userId;
	}

	public static checkUserRole = (roles: string[], userRole: string): void => {
		if (!roles.some((role: string) => role === userRole)) throw Error('Unauthorised User');
	}

}
