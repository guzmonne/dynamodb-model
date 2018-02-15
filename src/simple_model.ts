import * as cuid from 'cuid';
import { pick } from 'lodash';
import {
  Model,
  IModel,
  IItem,
  IDynamoDBKey,
  IDynamoDBModelConfig
} from './model';

export interface ISimpleModel extends IModel {
  callback(callback: (error: Error | null, data?: IItem | void) => void): void;
  promise(): Promise<IItem | void>;
  get(key: IDynamoDBKey): ISimpleModel;
}

export class SimpleModel extends Model implements ISimpleModel {
  private call: () => Promise<IItem | void> = () => Promise.resolve();

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }

  private handleError(error: Error): ISimpleModel {
    this.call = () => Promise.reject(error);
    return this;
  }

  promise(): Promise<IItem | void> {
    return this.call();
  }

  callback(callback: (error: Error | null, data?: IItem | void) => void): void {
    this.call()
      .then(data => callback(null, data))
      .catch(err => callback(err));
  }

  create(body: IItem): ISimpleModel {
    if (body[this.hash] === undefined) body[this.hash] = cuid();

    body = pick(body, Object.keys(this.struct.schema));

    if (this.track === true) body = { ...body, ...this.trackChanges(body) };

    try {
      this.validate(body);
    } catch (error) {
      return this.handleError(error);
    }

    this.call = () =>
      this.documentClient
        .put({
          TableName: this.table,
          Item: { ...body, ...this.addTenant(body as IDynamoDBKey) }
        })
        .promise()
        .then(() => body);

    return this;
  }

  get(key: IDynamoDBKey): ISimpleModel {
    this.call = () =>
      this.documentClient
        .get({
          TableName: this.table,
          Key: this.addTenant(key)
        })
        .promise()
        .then(data => data.Item);

    return this;
  }
}
