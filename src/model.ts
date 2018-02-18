import { struct } from 'superstruct';
import { pick } from 'lodash';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

/**
 * DynamoDB table item.
 *
 * @export
 * @interface IItem
 */
export interface IItem {
  [key: string]: any;
}
/**
 * DynamoDB Item Key.
 * A combination of `hash` and `range` key used to describe the table.
 *
 * @export
 * @interface IDynamoDBKey
 */
export interface IDynamoDBKey {
  [key: string]: string;
}
/**
 * Attributes used to track modification done to an item. The `createdAt`
 * attribute is only added when creating a new item, while the `updatedAt`
 * attribute is also updated on every update.
 *
 * @export
 * @interface IDynamoDBModelTrack
 */
export interface IDynamoDBModelTrack {
  updatedAt?: string;
  createdAt?: string;
}
/**
 * DynamoDBModel configuration options.
 *
 * @export
 * @interface IDynamoDBModelConfig
 */
export interface IDynamoDBModelConfig {
  /**
   * DynamoDBDocument client instance. Must be declared before configuring the
   * model.
   *
   * @type {DocumentClient}
   * @memberof IDynamoDBModelConfig
   */
  documentClient: DocumentClient;
  /**
   * The name of the `hash` key.
   *
   * @type {string}
   * @memberof IDynamoDBModelConfig
   */
  hash: string;
  /**
   * The type of the `hash` key.
   *
   * @type {('string' | 'number')}
   * @memberof IDynamoDBModelConfig
   */
  hashType?: 'string' | 'number';
  /**
   * The name of the index to use when running an `index` operation. By default
   * if will be called `byGSIK`. If the index is not created before hand, and
   * the model is configured with a `tenant`, then the method will fail.
   *
   * @type {string}
   * @memberof IDynamoDBModelConfig
   */
  indexName?: string;
  /**
   * The maximum GSIK values to use to index the models. This is necessary when
   * configuring a `tenant`, since you can't configure an IAM policy to restrict
   * access to an item with a prefix on its hash ID. So, a GSIK will be
   * configured on every item by the library, using the `tenant` value plus a
   * number between `0` and `maxGSIK`. Then you can create an IAM policy that
   * restrict access on the index (called by defaylt `byGSIK`) with access only
   * on the items with the appropiate GSIK value.
   *
   * @type {number}
   * @memberof IDynamoDBModelConfig
   */
  maxGSIK?: number;
  /**
   * The name of the `range` key.
   *
   * @type {string}
   * @memberof IDynamoDBModelConfig
   */
  range?: string;
  /**
   * The type of the `range` key.
   *
   * @type {('string' | 'number')}
   * @memberof IDynamoDBModelConfig
   */
  rangeType?: 'string' | 'number';
  /**
   * The struct representing the model. Should be configured followin the
   * [superstruct](https://github.com/ianstormtaylor/superstruct) configuration guide.
   *
   * @type {IDynamoDBModelStruct}
   * @memberof IDynamoDBModelConfig
   */
  struct: IDynamoDBModelStruct;
  /**
   * The table name. If not provided it will try to use the `table` name
   * globally configured.
   *
   * @type {string}
   * @memberof IDynamoDBModelConfig
   */
  table: string;
  /**
   * The `tenant` unique identifier.
   *
   * @type {string}
   * @memberof IDynamoDBModelConfig
   */
  tenant?: string;
  /**
   * Value used to track the dates where modifications were done to the item.
   *
   * @type {boolean}
   * @memberof IDynamoDBModelConfig
   */
  track?: boolean;
}
/**
 * The struct representing the model. Should be configured followin the
 * [superstruct](https://github.com/ianstormtaylor/superstruct) configuration guide.
 *
 *
 * @export
 * @interface IDynamoDBModelStruct
 */
export interface IDynamoDBModelStruct {
  [key: string]: string;
}
/**
 * Default Model interface.
 *
 * @export
 * @interface IModel
 */
export interface IModel {
  /**
   * Adds the `gsik` value to the item, created by joining the `tenant` value
   * with a random value between `0` and `maxGSIK`.
   *
   * @returns {IItem}
   * @memberof Model
   */
  addTenant(): IItem;
  data: IItem[];
  documentClient: DocumentClient;
  /**
   * Gets the `hash` and `range` key from the model.
   * If `tenant` is defined, it also adds it to the `hash` key.
   *
   * @param {IDynamoDBKey} key
   * @returns {IDynamoDBKey}
   * @memberof Model
   */
  getKey(key: IDynamoDBKey): IDynamoDBKey;
  hash: string;
  hashType: string;
  hasTenantRegExp?: RegExp;
  indexName: string;
  maxGSIK: number;
  range?: string;
  rangeType: string;
  /**
   * Removes all tenant data from an item.
   *
   * @param {IItem} items
   * @returns {IItem}
   * @memberof IModel
   */
  removeTenant(items: IItem): IItem;
  /**
   * Removes all tenant data from a list of items.
   *
   * @param {IItem[]} items
   * @returns {IItem[]}
   * @memberof IModel
   */
  removeTenant(items: IItem[]): IItem[];
  struct: any;
  table: string;
  tenant?: string;
  track: boolean;
  /**
   * Adds the appropiate track values if the `track` option is on.
   *
   * @param {IItem} body
   * @returns {IDynamoDBModelTrack}
   * @memberof Model
   */
  trackChanges(body: IItem): IDynamoDBModelTrack;
  /**
   * Validates the body of the request using [`superstruct`](https://github.com/ianstormtaylor/superstruct).
   *
   * @param {IItem} body
   * @returns {boolean}
   * @memberof Model
   */
  validate(body: IItem): boolean;
}
/**
 * Abstract class used to bootstrap a new Model.
 *
 * @export
 * @abstract
 * @class Model
 * @implements {IModel}
 */
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
      if (config.maxGSIK !== undefined) this.maxGSIK = config.maxGSIK;
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
  /**
   * Helper function that returns a function capable of removing characters
   * based on a predicate function.
   *
   * @private
   * @param {number} length
   * @param {(value: string) => boolean} predicate
   * @returns {(value: string) => string}
   * @memberof Model
   */
  private substringBy(
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
  ): IItem {
    item[this.hash] = substring(item[this.hash]);
    if (item.gsik !== undefined) delete item.gsik;
    return item;
  }
  removeTenant(items: IItem): IItem;
  removeTenant(items: IItem[]): IItem[];
  /**
   * Removes all `tenant` related data from an item, or a list of items.
   *
   * @param {(IItem | IItem[])} items
   * @returns {(IItem | IItem[])}
   * @memberof Model
   */
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
