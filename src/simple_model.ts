import * as cuid from 'cuid';
import { pick, omit } from 'lodash';
import {
  Model,
  IModel,
  IItem,
  IDynamoDBKey,
  IDynamoDBModelConfig
} from './model';

interface IExpressionAttributeValues {
  [key: string]: any;
}

interface IExpressionAttributeNames {
  [key: string]: string;
}

interface IUpdateExpressionAttributes {
  UpdateExpression: string;
  ExpressionAttributeNames: IExpressionAttributeNames;
  ExpressionAttributeValues: IExpressionAttributeValues;
}

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

  private createUpdateExpressionParams(
    body: IItem
  ): IUpdateExpressionAttributes {
    body = omit(
      body,
      this.range !== undefined ? [this.hash, this.range] : this.hash
    );

    var expressions: string[] = [],
      attributeNames: IExpressionAttributeNames = {},
      attributeValues: IExpressionAttributeValues = {};

    for (var key in body) {
      expressions.push(`#${key} = :${key}`);
      attributeNames[`#${key}`] = key;
      attributeValues[`:${key}`] = body[key];
    }

    if (expressions.length === 0)
      throw new Error(`Can't construct UpdateExpression from the body`);

    return {
      UpdateExpression: expressions.join(','),
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues
    };
  }

  async promise(): Promise<IItem | void> {
    try {
      return await this.call();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  callback(callback: (error: Error | null, data?: IItem | void) => void): void {
    this.promise()
      .then(data => callback(null, data))
      .catch(err => callback(err));
  }

  create(body: IItem): ISimpleModel {
    body = pick(body, Object.keys(this.struct.schema));

    if (this.track === true) body = { ...body, ...this.trackChanges(body) };

    if (body[this.hash] === undefined) body[this.hash] = cuid();

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

  update(body: IItem): ISimpleModel {
    if (body[this.hash] === undefined)
      return this.handleError(
        new Error(`The value of '${this.hash}' can't be undefined`)
      );

    if (this.range !== undefined && body[this.range] === undefined)
      return this.handleError(
        new Error(`The value of '${this.range}' can't be undefined`)
      );

    body = pick(body, Object.keys(this.struct.schema));

    if (this.track === true) body = { ...body, ...this.trackChanges(body) };

    try {
      this.validate(body);
    } catch (error) {
      if (error.value !== undefined) return this.handleError(error);
    }

    this.call = () =>
      this.documentClient
        .update({
          TableName: this.table,
          Key: this.addTenant(body),
          ...this.createUpdateExpressionParams(body)
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

  delete(key: IDynamoDBKey): ISimpleModel {
    this.call = () =>
      this.documentClient
        .delete({
          TableName: this.table,
          Key: this.addTenant(key)
        })
        .promise();
    return this;
  }
}
