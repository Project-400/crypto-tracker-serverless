import { MigrationsController } from './valuation.controller';
import { MigrationsService } from './valuation.service';
import { ApiHandler } from '../../api-shared-modules/src/types';

const migrationsService: MigrationsService = new MigrationsService();
const controller: MigrationsController = new MigrationsController(migrationsService);

export const getMigration: ApiHandler = controller.getMigration;
