import * as cuid from 'cuid';
import { btoa } from './utils';
import { pick, omit, range } from 'lodash';
import {
  Model,
  IModel,
  IItem,
  IDynamoDBKey,
  IDynamoDBModelConfig
} from './model';

interface IDynamoDBModelScanData {
  items: IItem[];
  count: number;
  offset?: string;
}

export interface IDynamoDBModelIndexOptions {
  limit?: number;
  offset?: string;
  filter?: string;
  attributes?: string;
}

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

export interface IDefaultModel extends IModel {
  callback(callback: (error: Error | null, data?: IItem | void) => void): void;
  promise(): Promise<IItem | void>;
  get(key: IDynamoDBKey): IDefaultModel;
  delete(key: IDynamoDBKey): IDefaultModel;
  create(body: IItem): IDefaultModel;
  update(body: IItem): IDefaultModel;
  index(options?: IDynamoDBModelIndexOptions): IDefaultModel;
}
/**
 * Default Model
 * ===
 *
 * This basic model has some basic methods to interact with DynamoDB. It has
 * implemented all the typical `CRUD` operations, and translates them into
 * DynamoDB DocumentClient calls. By using a model, you can avoid having to
 * learn how to work with DynamoDB.
 *
 * If you want to add more methods to your model, you can create your own class
 * extended from this one.
 */
export class DefaultModel extends Model implements IDefaultModel {
  /**
   * DynamoDB Document Client call. You can call it by using the `callback` or
   * `promise` method.
   */
  private call: () => Promise<IItem | void> = () => Promise.resolve();

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }
  /**
   * Helper function to handle errors lazily. This way the user can handle
   * them through the `callback` or `promise` api.
   * @param error Error thrown during a method call.
   */
  private handleError(error: Error): IDefaultModel {
    this.call = () => Promise.reject(error);
    return this;
  }
  /**
   * Creates the `UpdateExpression`, `ExpressionAttributeNames` and
   * `ExpressionAttributeValues` for the `documentClient.update` method params.
   * @param body Body if the item to be stored.
   */
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

    expressions = [`SET ${expressions[0]}`].concat(
      expressions.slice(1, expressions.length)
    );

    return {
      UpdateExpression: expressions.join(', '),
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues
    };
  }
  /**
   * Does the stored DynamoDB DocumentClient call and wraps the result in
   * promise. It handles error produced on the call.
   */
  async promise(): Promise<IItem | void> {
    try {
      return await this.call();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  /**
   * Does the stored DynamoDB DocumentClient call and wraps the result in a
   * callback. It handles error produced on the call, and passes the onto the
   * callback on the `err` argument.
   * @param callback Callback function to invoke with the data or the error
   * generated on the DynamoDB DocumentClient call.
   */
  callback(callback: (error: Error | null, data?: IItem | void) => void): void {
    this.promise()
      .then(data => callback(null, data))
      .catch(err => callback(err));
  }
  /**
   * Sets up a call to DynamoDB to create a new item.
   * @param body Body of the item to be created.
   */
  create(body: IItem): IDefaultModel {
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
          Item: {
            ...body,
            ...this.getKey(body as IDynamoDBKey),
            ...this.addTenant()
          }
        })
        .promise()
        .then(() => body);

    return this;
  }
  /**
   * Sets a call to DynamoDB to update an item.
   * @param body Body of the item to be updated.
   */
  update(body: IItem): IDefaultModel {
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
          Key: this.getKey(body),
          ...this.createUpdateExpressionParams(body)
        })
        .promise()
        .then(() => body);

    return this;
  }
  /**
   * Sets a call to get an item from DynamoDB.
   * @param key Item key.
   */
  get(key: IDynamoDBKey): IDefaultModel {
    this.call = () =>
      this.documentClient
        .get({
          TableName: this.table,
          Key: this.getKey(key)
        })
        .promise()
        .then(data => data.Item);

    return this;
  }
  /**
   * Sets a call to DynamoDB to delete an item.
   * @param key Item key.
   */
  delete(key: IDynamoDBKey): IDefaultModel {
    this.call = () =>
      this.documentClient
        .delete({
          TableName: this.table,
          Key: this.getKey(key)
        })
        .promise();
    return this;
  }
  /**
   * Sets a call to scan the DynamoDB table according to the provided options.
   * @param options Index options used to define what items to return.
   */
  private scan(options: IDynamoDBModelIndexOptions): IDefaultModel {
    this.call = () =>
      this.documentClient
        .scan({
          TableName: this.table,
          ...(options.limit !== undefined ? { Limit: options.limit } : {}),
          ...(options.offset !== undefined
            ? { ExclusiveStartKey: JSON.parse(atob(options.offset)) }
            : {})
        })
        .promise()
        .then(data => {
          return {
            items: data.Items as IItem[],
            count: data.Count,
            ...(data.LastEvaluatedKey !== undefined
              ? { offset: btoa(JSON.stringify(data.LastEvaluatedKey)) }
              : {})
          };
        });

    return this;
  }
  /**
   * Sets a call to query the DynamoDB table according to the provided options.
   * @param options Index options used to define what items to return.
   */
  private query(options: IDynamoDBModelIndexOptions): IDefaultModel {
    this.call = () =>
      Promise.all(
        range(0, this.maxGSIK).map(i => {
          var params = {
            TableName: this.table,
            IndexName: this.indexName,
            KeyConditionExpression: `#gsik = :gsik`,
            ExpressionAttributeNames: {
              '#gsik': 'gsik'
            },
            ExpressionAttributeValues: {
              ':gsik': `${this.tenant}|${i}`
            },
            ...(options.limit !== undefined
              ? { Limit: Math.floor(options.limit / this.maxGSIK) }
              : {}),
            ...(options.offset !== undefined
              ? {
                  ExclusiveStartKey: this.getKey(
                    JSON.parse(atob(options.offset))
                  )
                }
              : {})
          };

          return this.documentClient
            .query(params)
            .promise()
            .then((data): IDynamoDBModelScanData => {
              return {
                items: data.Items || [],
                count: data.Count || 0,
                ...(data.LastEvaluatedKey !== undefined
                  ? {
                      offset: JSON.stringify(
                        this.removeTenant(data.LastEvaluatedKey)
                      )
                    }
                  : {})
              };
            });
        })
      ).then((results: IDynamoDBModelScanData[]): IDynamoDBModelScanData =>
        results.reduce(
          (
            acc: IDynamoDBModelScanData,
            result: IDynamoDBModelScanData
          ): IDynamoDBModelScanData => ({
            ...acc,
            items: acc.items.concat(this.removeTenant(result.items) || []),
            count: acc.count + result.count,
            ...(result.offset !== undefined
              ? {
                  offset:
                    acc.offset !== undefined
                      ? acc.offset + '|' + result.offset
                      : result.offset
                }
              : {})
          }),
          {
            items: [],
            count: 0,
            offset: undefined
          }
        )
      );

    return this;
  }
  /**
   * Sets a call to DynamoDB to get a list of items.
   * @param options Index options used to set what items to return.
   */
  index(options?: IDynamoDBModelIndexOptions): IDefaultModel {
    options = { limit: 100, ...options };

    if (this.tenant === undefined) return this.scan(options);

    return this.query(options);
  }
}
