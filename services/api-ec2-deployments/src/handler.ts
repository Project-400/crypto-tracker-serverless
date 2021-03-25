import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { Ec2DeploymentsController } from './ec2-deployments.controller';
import { Ec2DeploymentsService } from './ec2-deployments.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const ec2DeploymentsService: Ec2DeploymentsService = new Ec2DeploymentsService(unitOfWork);
const controller: Ec2DeploymentsController = new Ec2DeploymentsController(ec2DeploymentsService);

export const addLatestDeployment: ApiHandler = controller.addLatestDeployment;
