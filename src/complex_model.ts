import * as cuid from 'cuid';
import { pick } from 'lodash';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { IModel, Model } from './model';
import {
  IDynamoDBModel,
  IItem,
  ICallResult,
  IDynamoDBModelConfig,
  IDynamoDBKey
} from './index.d';

interface IComplexModel extends IModel {
  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  delete(key: IDynamoDBKey): IDynamoDBModel;
  delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  promise(): Promise<void>;
}

export class ComplexModel extends Model implements IComplexModel {
  private calls: (() => Promise<ICallResult>)[] = [];

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }

  private handleValidationError(
    err: Error,
    callback?: (error: Error | null) => void
  ): IDynamoDBModel | void {
    if (typeof callback === 'function') return callback(err);

    this.calls.push(() => {
      throw err;
    });

    return this;
  }

  delete(key: IDynamoDBKey): IDynamoDBModel;
  delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  delete(
    key: IDynamoDBKey,
    callback?: (error: Error | null) => void
  ): void | IDynamoDBModel {
    var call = this.documentClient.delete({
      TableName: this.table,
      Key: this.addTenant(key)
    });

    if (typeof callback === 'function')
      return call.send(err => {
        if (err !== null) return callback(err);
        callback(null);
      });

    this.calls.push(() =>
      call
        .promise()
        .then((): ICallResult => ({
          items: []
        }))
        .catch(err => {
          throw err;
        })
    );
  }

  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  get(
    key: IDynamoDBKey,
    callback?: (error: Error | null) => void
  ): void | IDynamoDBModel {
    var call = this.documentClient.get({
      TableName: this.table,
      Key: this.addTenant(key)
    });

    if (typeof callback === 'function')
      return call.send((err, data) => {
        if (err !== null) return callback(err);
        this.data.push(this.removeTenant(data));
        callback(null);
      });

    this.calls.push(() =>
      call
        .promise()
        .then((data: DocumentClient.GetItemOutput): ICallResult => {
          var items =
            data.Item === undefined ? [] : [this.removeTenant(data.Item)];

          return { items };
        })
        .catch(err => {
          throw err;
        })
    );

    return this as IDynamoDBModel;
  }

  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  create(
    body: IItem,
    callback?: (error: Error | null) => void
  ): void | IDynamoDBModel {
    if (body[this.hash] === undefined) body[this.hash] = cuid();

    try {
      this.validate(body);
    } catch (err) {
      return this.handleValidationError(err, callback);
    }

    body = {
      ...pick(body, Object.keys(this.schema), this.hash, this.range || ''),
      ...this.trackChanges(body)
    };

    var params = {
      TableName: this.table,
      Item: {
        ...body,
        ...this.addTenant(body)
      }
    };

    var call = this.documentClient.put(params);

    if (typeof callback === 'function')
      return call.send(err => {
        if (err !== null) return callback(err);
        this.data.push(body);
        callback(null);
      });

    this.calls.push(() =>
      call
        .promise()
        .then((): ICallResult => ({
          items: [body]
        }))
        .catch(err => {
          throw err;
        })
    );

    return this as IDynamoDBModel;
  }
  /*
  set(body: IItem): IDynamoDBModel;
  set(body: IItem, callback: (error: Error | null) => void): void;
  set(body: IItem, callback?: (error: Error | null) => void): void {
    var call = this.documentClient.update({
      TableName: this.table,
      Key: this.addTenant(body as IDynamoDBKey),
      UpdateExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': 'John Doe'
      }
    });

    if (typeof callback === 'function')
      return call.send(err => {
        if (err !== null) return callback(err);
        callback(null);
      });

    return this as IDynamoDBModel;
  }
*/

  async promise(): Promise<void> {
    for (let call of this.calls) {
      var result: ICallResult = await call();
      this.data = result.items;
    }
  }
}
