import { ApiHandler, UnitOfWork } from '../../api-shared-modules/src';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const unitOfWork: UnitOfWork = new UnitOfWork();
const userService: UserService = new UserService(unitOfWork);
const controller: UserController = new UserController(userService);

export const getAllUsers: ApiHandler = controller.getAllUsers;
export const getUserById: ApiHandler = controller.getUserById;
export const updateUser: ApiHandler = controller.updateUser;
