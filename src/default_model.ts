import * as cuid from 'cuid';
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

export interface IDynamoDBModelScanOptions {
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
  index(options?: IDynamoDBModelScanOptions): IDefaultModel;
}

export class DefaultModel extends Model implements IDefaultModel {
  private call: () => Promise<IItem | void> = () => Promise.resolve();

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }

  private handleError(error: Error): IDefaultModel {
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

  private scan(options: IDynamoDBModelScanOptions): IDefaultModel {
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
            items: this.removeTenant(data.Items as IItem[]),
            count: data.Count,
            offset: btoa(JSON.stringify(data.LastEvaluatedKey))
          };
        });

    return this;
  }

  private query(options: IDynamoDBModelScanOptions): IDefaultModel {
    this.call = () =>
      Promise.all(
        range(0, this.maxGSIK).map(i =>
          this.documentClient
            .query({
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
            })
            .promise()
            .then((data): IDynamoDBModelScanData => ({
              items: data.Items || [],
              count: data.Count || 0,
              ...(data.LastEvaluatedKey !== undefined
                ? {
                    offset: JSON.stringify(
                      this.removeTenant(data.LastEvaluatedKey)
                    )
                  }
                : {})
            }))
        )
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

  index(options?: IDynamoDBModelScanOptions): IDefaultModel {
    options = { limit: 100, ...options };

    if (this.tenant === undefined) return this.scan(options);

    return this.query(options);
  }
}
