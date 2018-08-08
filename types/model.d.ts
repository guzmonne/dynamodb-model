import { DynamoDB } from 'aws-sdk';
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
     * @type {DynamoDB.DocumentClient}
     * @memberof IDynamoDBModelConfig
     */
    documentClient: DynamoDB.DocumentClient;
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
    documentClient: DynamoDB.DocumentClient;
    /**
     * Gets the `hash` and `range` key from the model.
     * If `tenant` is defined, it also adds it to the `hash` key.
     *
     * @param {IDynamoDBKey} key
     * @returns {IDynamoDBKey}
     * @memberof Model
     */
    getKey(key: IDynamoDBKey): IDynamoDBKey;
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
     * @type {string}
     * @memberof IDynamoDBModelConfig
     */
    hashType: string;
    /**
     * Regular expression to use when checking if the `hash` key has the `tenant`
     * prefixed.
     *
     * @type {RegExp}
     * @memberof IModel
     */
    hasTenantRegExp?: RegExp;
    /**
     * The name of the index to use when running an `index` operation. By default
     * if will be called `byGSIK`. If the index is not created before hand, and
     * the model is configured with a `tenant`, then the method will fail.
     *
     * @type {string}
     * @memberof IModel
     */
    indexName: string;
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
     * @memberof IModel
     */
    maxGSIK: number;
    /**
     * The name of the `range` key.
     *
     * @type {string}
     * @memberof IModel
     */
    range?: string;
    /**
     * The type of the `range` key.
     *
     * @type {string}
     * @memberof IModel
     */
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
    /**
     * The struct representing the model. Should be configured followin the
     * [superstruct](https://github.com/ianstormtaylor/superstruct) configuration guide.
     */
    struct: IDynamoDBModelStruct;
    /**
     * DynamoDB table name to store the model.
     *
     * @type {string}
     * @memberof IModel
     */
    table: string;
    /**
     * The `tenant` unique identifier.
     *
     * @type {string}
     * @memberof IModel
     */
    tenant?: string;
    /**
     * Value used to track the dates where modifications were done to the item.
     *
     * @type {boolean}
     * @memberof IModel
     */
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
export declare abstract class Model implements IModel {
    /**
     * DynamoDBDocument client instance. Must be declared before configuring the
     * model.
     *
     * @type {DynamoDB.DocumentClient}
     * @memberof Model
     */
    documentClient: DynamoDB.DocumentClient;
    /**
     * The name of the `hash` key.
     *
     * @type {string}
     * @memberof Model
     */
    hash: string;
    /**
     * The type of the `hash` key.
     *
     * @type {string}
     * @memberof Model
     */
    hashType: string;
    /**
     * Regular expression to use when checking if the `hash` key has the `tenant`
     * prefixed.
     *
     * @type {RegExp}
     * @memberof Model
     */
    hasTenantRegExp?: RegExp;
    /**
     * The name of the index to use when running an `index` operation. By default
     * if will be called `byGSIK`. If the index is not created before hand, and
     * the model is configured with a `tenant`, then the method will fail.
     *
     * @type {string}
     * @memberof Model
     */
    indexName: string;
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
     * @memberof Model
     */
    maxGSIK: number;
    /**
     * The name of the `range` key.
     *
     * @type {string}
     * @memberof Model
     */
    range?: string;
    /**
     * The type of the `range` key.
     *
     * @type {string}
     * @memberof Model
     */
    rangeType: string;
    /**
     * The table name. If not provided it will try to use the `table` name
     * globally configured.
     *
     * @type {string}
     * @memberof Model
     */
    table: string;
    /**
     * The `tenant` unique identifier.
     *
     * @type {string}
     * @memberof Model
     */
    tenant?: string;
    /**
     * Value used to track the dates where modifications were done to the item.
     *
     * @type {boolean}
     * @memberof Model
     */
    track: boolean;
    /**
     * Struct instance created from the `struct` data passed through the model
     * configuration.
     *
     * @type {*}
     * @memberof Model
     */
    struct: any;
    constructor(config: IDynamoDBModelConfig);
    /**
     * Tracks the updatedAt and createdAt values.
     *
     * @param {IItem} body Update object body
     * @returns {IDynamoDBModelTrack} Track body object,
     * @memberof Model
     */
    trackChanges(body: IItem): IDynamoDBModelTrack;
    /**
     * Returns a valid key from an IDynamoDBKey like object.
     *
     * @param {IDynamoDBKey} key IDynamoDBKey like object.
     * @returns {IDynamoDBKey} Valid IDynamoDBKey
     * @memberof Model
     */
    getKey(key: IDynamoDBKey): IDynamoDBKey;
    /**
     * Adds the tenant information to the key.
     *
     * @param {IDynamoDBKey} key Object containing the DynamoDB key.
     * @returns {IDynamoDBKey} Object containing the DynamoDB key with plus the
     * tenant.
     * @memberof Model
     */
    addTenantToHashKey(key: IDynamoDBKey): IDynamoDBKey;
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
    private substringBy(length, predicate);
    addTenant(): IItem;
    private removeTenantFromItem(item, substring);
    removeTenant(items: IItem): IItem;
    removeTenant(items: IItem[]): IItem[];
    validate(body: IItem): boolean;
}
