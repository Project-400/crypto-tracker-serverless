import { MigrationsService } from './valuation.service';
import { ApiContext, ApiEvent, ApiHandler, ApiResponse } from '../../api-shared-modules/src/types';

export class MigrationsController {

	public constructor(private migrationsService: MigrationsService) { }

	public getMigration: ApiHandler = async (event: ApiEvent, context: ApiContext): Promise<ApiResponse> => {
		console.log(this.migrationsService);
		return undefined;
	}

}
