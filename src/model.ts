import { pick, isObject } from 'lodash';
import * as cuid from 'cuid';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IItem {
  [key: string]: any;
}

export interface IDynamoDBKey {
  [key: string]: string;
}

export interface IDynamoDBModelSchemaOptions {
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  required?: boolean;
}

export interface IDynamoDBModelSchema {
  [key: string]: IDynamoDBModelSchemaOptions;
}

export interface IDynamoDBModelConfig {
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  track?: boolean;
  tenant?: string;
  documentClient: DocumentClient;
}

export interface IDynamoDBModel {
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  //track?: boolean;
  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  promise(): Promise<void>;
}

interface ICallResult {
  items: IItem[];
  count: number;
  lastEvaluatedKey?: IDynamoDBKey;
}

export class Model implements IDynamoDBModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  tenant?: string;

  private calls: (() => Promise<ICallResult>)[] = [];

  constructor(config: IDynamoDBModelConfig) {
    this.hash = config.hash;
    this.table = config.table;
    this.documentClient = config.documentClient;
    this.schema = config.schema;
    if (config.range !== undefined) this.range = config.range;
    if (config.tenant !== undefined) this.tenant = config.tenant;
  }

  private getKey(key: IDynamoDBKey) {
    key = pick(key, this.hash, this.range || '');
    key[this.hash] = [this.tenant, key[this.hash]]
      .filter(x => x !== undefined)
      .join('|');
    return key;
  }

  private validateType(value: any, key: string, type: string): void {
    var error: boolean;
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        error = typeof value !== type;
        break;
      case 'array':
        error = Array.isArray(value) === false;
        break;
      case 'object':
        error = isObject(value) === false;
        break;
      default:
        throw new Error(`Type ${type} is not a valid schema type`);
    }
    if (error === true)
      throw new Error(`The value of \`${key}\` should be a ${type}`);
  }

  private validateRequired(value: any, key: string, required: boolean): void {
    if (value === undefined && required === true)
      throw new Error(`The attribute \`${key}\` is required.`);
  }

  private validate(body: IItem): boolean {
    for (let key in this.schema) {
      var rules = this.schema[key];
      var value = body[key];
      if (value !== undefined) {
        this.validateType(value, key, rules.type);
      }
      this.validateRequired(value, key, !!rules.required);
    }
    return true;
  }

  private handleValidationError(
    err: Error,
    callback?: (error: Error | null) => void
  ): void {
    if (typeof callback === 'function') return callback(err);

    this.calls.push(() => Promise.reject(err));
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
      ...pick(body, Object.keys(this.schema)),
      ...this.getKey(body as IDynamoDBKey)
    };

    var call = this.documentClient.put({
      TableName: this.table,
      Item: body
    });

    if (typeof callback === 'function')
      return call.send(err => {
        if (err !== null) return callback(err);
        this.data.push(body);
        callback(null);
      });

    this.calls.push(() =>
      call.promise().then((): ICallResult => ({
        items: [body],
        count: 1
      }))
    );

    return this as IDynamoDBModel;
  }

  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  get(
    key: IDynamoDBKey,
    callback?: (error: Error | null) => void
  ): void | IDynamoDBModel {
    var call = this.documentClient.get({
      TableName: this.table,
      Key: this.getKey(key)
    });

    if (typeof callback === 'function')
      return call.send((err, data) => {
        if (err !== null) return callback(err);
        this.data.push(data);
        callback(null);
      });

    this.calls.push(() =>
      call
        .promise()
        .then((data: DocumentClient.GetItemOutput): ICallResult => ({
          items: data.Item === undefined ? [] : [data.Item],
          count: data.Item === undefined ? 0 : 1
        }))
    );

    return this as IDynamoDBModel;
  }

  async promise(): Promise<void> {
    for (let call of this.calls) {
      var result: ICallResult = await call();
      this.data = result.items;
      return;
    }
  }
}
