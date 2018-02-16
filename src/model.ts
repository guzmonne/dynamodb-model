import { struct } from 'superstruct';
import { pick } from 'lodash';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IItem {
  [key: string]: any;
}

export interface IDynamoDBKey {
  [key: string]: string;
}

export interface IDynamoDBModelTrack {
  updatedAt?: string;
  createdAt?: string;
}

export interface IDynamoDBModelConfig {
  hash: string;
  hashType?: 'string' | 'number';
  range?: string;
  rangeType?: 'string' | 'number';
  struct: IDynamoDBModelStruct;
  table: string;
  track?: boolean;
  tenant?: string;
  documentClient: DocumentClient;
}

export interface IDynamoDBModelStruct {
  [key: string]: string;
}

export interface IModel {
  data: IItem[];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  struct: IDynamoDBModelStruct;
  table: string;
  tenant?: string;
  track: boolean;
}

export abstract class Model implements IModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  hashType: string = 'string';
  hasTenantRegExp?: RegExp;
  range?: string;
  rangeType: string = 'string';
  table: string;
  tenant?: string;
  track: boolean = false;
  struct: any;

  constructor(config: IDynamoDBModelConfig) {
    this.table = config.table;
    this.documentClient = config.documentClient;

    this.hash = config.hash;
    if (config.hashType !== undefined) this.hashType = config.hashType;

    var configStruct = {
      ...config.struct,
      [this.hash]: this.hashType
    };

    if (config.range !== undefined) {
      this.range = config.range;
      if (config.rangeType !== undefined) this.rangeType = config.rangeType;
      configStruct[this.range] = this.rangeType;
    }

    if (config.track !== undefined) {
      this.track = config.track;
      configStruct.createdAt = 'string';
      configStruct.updatedAt = 'string';
    }

    this.struct = struct(configStruct);

    if (config.tenant !== undefined) {
      this.tenant = config.tenant;
      this.hasTenantRegExp = new RegExp(`^${this.tenant}|`);
    }
  }

  trackChanges(body: IItem): IDynamoDBModelTrack {
    if (this.track === false) return {} as IDynamoDBModelTrack;
    var isoDate = new Date().toISOString();
    var isNew = body[this.hash] === undefined;
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

  validate(body: IItem): boolean {
    return this.struct(body);
  }
}
