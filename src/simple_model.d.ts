import { IItem, IDynamoDBKey, IDynamoDBModelConfig } from './index.d';
import { IModel } from './model.d';

interface ISimpleModel extends IModel {
  callback(callback: (error: Error | null, data?: IItem | void) => void): void;
  promise(): Promise<IItem | void>;
  get(key: IDynamoDBKey): ISimpleModel;
}
