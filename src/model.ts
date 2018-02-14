import { pick, isObject } from 'lodash';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  IItem,
  IDynamoDBModelSchema,
  IDynamoDBModelConfig,
  IDynamoDBModelTrack,
  IDynamoDBKey
} from './index.d';

export interface IModel {
  data: IItem[];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  tenant?: string;
  track: boolean;
}

export abstract class Model implements IModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  tenant?: string;
  track: boolean = false;

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

  trackChanges(body: IItem): IDynamoDBModelTrack {
    if (this.track === false) return {} as IDynamoDBModelTrack;
    var isoDate = new Date().toISOString();
    var isNew = body[this.hash] !== undefined;
    var result: IDynamoDBModelTrack = {
      updatedAt: isoDate
    };
    if (isNew === true) result.createdAt = isoDate;
    return result;
  }

  addTenant(key: IDynamoDBKey): IDynamoDBKey {
    key = pick(key, this.hash, this.range || '');
    key[this.hash] = [this.tenant, key[this.hash]]
      .filter(x => x !== undefined)
      .join('|');
    return key;
  }

  substringBy(
    length: number,
    predicate: (value: string) => boolean
  ): (value: string) => string {
    return (value: string) =>
      predicate(value) === true ? value.substring(length) : value;
  }

  removeTenant(items: IItem): IItem;
  removeTenant(items: IItem[]): IItem[];
  removeTenant(items: IItem | IItem[]): IItem | IItem[] {
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

  validateType(value: any, key: string, type: string): void {
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

  validateRequired(value: any, key: string, required: boolean): void {
    if (value === undefined && required === true)
      throw new Error(`The attribute \`${key}\` is required.`);
  }

  validate(body: IItem): boolean {
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
}
