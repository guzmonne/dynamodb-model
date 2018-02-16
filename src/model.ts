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
  documentClient: DocumentClient;
  hash: string;
  hashType?: 'string' | 'number';
  indexName?: string;
  maxGSIK: number;
  range?: string;
  rangeType?: 'string' | 'number';
  struct: IDynamoDBModelStruct;
  table: string;
  tenant?: string;
  track?: boolean;
}

export interface IDynamoDBModelStruct {
  [key: string]: string;
}

export interface IModel {
  data: IItem[];
  documentClient: DocumentClient;
  hash: string;
  hashType: string;
  hasTenantRegExp?: RegExp;
  indexName: string;
  maxGSIK: number;
  range?: string;
  rangeType: string;
  table: string;
  tenant?: string;
  track: boolean;
  struct: any;
}

export abstract class Model implements IModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  hashType: string = 'string';
  hasTenantRegExp?: RegExp;
  indexName: string = 'byGSIK';
  maxGSIK: number = 10;
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
      if (config.maxGSIK >= 0) this.maxGSIK = config.maxGSIK;
    }

    if (config.indexName !== undefined) {
      this.indexName = config.indexName;
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

  getKey(key: IDynamoDBKey): IDynamoDBKey {
    key = pick(key, this.hash, this.range || '');
    key[this.hash] =
      this.tenant !== undefined
        ? this.tenant + '|' + key[this.hash]
        : key[this.hash];
    return key;
  }

  substringBy(
    length: number,
    predicate: (value: string) => boolean
  ): (value: string) => string {
    return (value: string) =>
      predicate(value) === true ? value.substring(length) : value;
  }

  addTenant(): IItem {
    return this.tenant !== undefined && this.tenant !== ''
      ? {
          gsik: this.tenant + '|' + Math.floor(Math.random() * this.maxGSIK)
        }
      : {};
  }

  private removeTenantFromItem(
    item: IItem,
    substring: (value: string) => string
  ) {
    item[this.hash] = substring(item[this.hash]);
    if (item.gsik !== undefined) delete item.gsik;
    return item;
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
      return items.map((item: IItem) =>
        this.removeTenantFromItem(item, substringIfTenantPrefix)
      );

    return this.removeTenantFromItem(items, substringIfTenantPrefix);
  }

  validate(body: IItem): boolean {
    return this.struct(body);
  }
}
