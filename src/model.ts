import { pick, isObject } from 'lodash';
import * as cuid from 'cuid';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  IDynamoDBModel,
  IItem,
  IDynamoDBModelSchema,
  ICallResult,
  IDynamoDBModelConfig,
  IDynamoDBModelTrack,
  IDynamoDBKey
} from './model.d';

export class Model implements IDynamoDBModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  tenant?: string;
  track: boolean = false;

  private calls: (() => Promise<ICallResult>)[] = [];

  constructor(config: IDynamoDBModelConfig) {
    this.hash = config.hash;
    this.table = config.table;
    this.documentClient = config.documentClient;
    this.schema = config.schema;
    if (config.track !== undefined) this.track = config.track;
    if (config.range !== undefined) this.range = config.range;
    if (config.tenant !== undefined) {
      this.tenant = config.tenant;
      this.hasTenantRegExp = new RegExp(`^${this.tenant}|`);
    }
  }

  private trackChanges(body: IItem): IDynamoDBModelTrack {
    if (this.track === false) return {} as IDynamoDBModelTrack;
    var isoDate = new Date().toISOString();
    var isNew = body[this.hash] !== undefined;
    var result: IDynamoDBModelTrack = {
      updatedAt: isoDate
    };
    if (isNew === true) result.createdAt = isoDate;
    return result;
  }

  private addTenant(key: IDynamoDBKey): IDynamoDBKey {
    key = pick(key, this.hash, this.range || '');
    key[this.hash] = [this.tenant, key[this.hash]]
      .filter(x => x !== undefined)
      .join('|');
    return key;
  }

  private substringBy(
    length: number,
    predicate: (value: string) => boolean
  ): (value: string) => string {
    return (value: string) =>
      predicate(value) === true ? value.substring(length) : value;
  }

  private removeTenant(items: IItem): IItem;
  private removeTenant(items: IItem[]): IItem[];
  private removeTenant(items: IItem | IItem[]): IItem | IItem[] {
    if (this.tenant === undefined) return items;

    var regexp = this.hasTenantRegExp || new RegExp(`^${this.tenant}|`);
    var length = this.tenant.length + 1 || 0;

    var substringIfTenantPrefix = this.substringBy(
      length,
      (value: string) => value !== undefined && regexp.test(value) === true
    );

    if (Array.isArray(items))
      return items.map((item: IItem) => {
        item[this.hash] = substringIfTenantPrefix(item[this.hash]);
        return item;
      });

    items[this.hash] = substringIfTenantPrefix(items[this.hash]);

    return items;
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
    if (body[this.hash] === undefined)
      throw new Error(`The hash key \`${this.hash}\` can't be undefined.`);
    if (this.range !== undefined && body[this.range] === undefined)
      throw new Error(`The range key \`${this.range}\` can't be undefined.`);
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
  ): IDynamoDBModel | void {
    if (typeof callback === 'function') return callback(err);

    this.calls.push(() => {
      throw err;
    });

    return this;
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
          var items = this.removeTenant(
            data.Item === undefined ? [] : [data.Item]
          );

          return {
            items
          };
        })
        .catch(err => {
          throw err;
        })
    );

    return this as IDynamoDBModel;
  }

  async promise(): Promise<void> {
    for (let call of this.calls) {
      var result: ICallResult = await call();
      this.data = result.items;
    }
  }
}
