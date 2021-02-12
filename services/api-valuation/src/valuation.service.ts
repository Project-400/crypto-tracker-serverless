import { UnitOfWork } from '../../api-shared-modules/src/data-access';

export class ValuationService {

	public constructor(private unitOfWork: UnitOfWork) { }

	public getValuation = async (symbols: string[]): Promise<void> => {

	}

}
