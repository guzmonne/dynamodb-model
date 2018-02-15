import {
  IDynamoDBModel,
  IItem,
  ICallResult,
  IDynamoDBModelConfig,
  IDynamoDBKey
} from './index.d';
import { IModel } from './model.d';

export interface IComplexModel extends IModel {
  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  delete(key: IDynamoDBKey): IDynamoDBModel;
  delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  promise(): Promise<void>;
}
