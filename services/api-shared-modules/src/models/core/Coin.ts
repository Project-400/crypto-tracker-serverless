import { DynamoDbItem } from '../DynamoDBItem';
import { attribute } from '@aws/dynamodb-data-mapper-annotations';
import { Coin, CoinNetwork } from '../../types';

export class CoinItem extends DynamoDbItem implements Coin {

	@attribute()
	public coin: string;

	@attribute()
	public depositAllEnable: boolean;

	@attribute()
	public free: number;

	@attribute()
	public freeze: number;

	@attribute()
	public ipoable: number;

	@attribute()
	public ipoing: number;

	@attribute()
	public isLegalMoney: boolean;

	@attribute()
	public locked: number;

	@attribute()
	public name: string;

	@attribute()
	public networkList: CoinNetwork[];

	@attribute()
	public storage: number;

	@attribute()
	public trading: boolean;

	@attribute()
	public withdrawAllEnable: boolean;

	@attribute()
	public withdrawing: number;

}
