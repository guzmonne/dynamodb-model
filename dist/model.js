"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superstruct_1 = require("superstruct");
const lodash_1 = require("lodash");
/**
 * Abstract class used to bootstrap a new Model.
 *
 * @export
 * @abstract
 * @class Model
 * @implements {IModel}
 */
class Model {
    constructor(config) {
        /**
         * The type of the `hash` key.
         *
         * @type {string}
         * @memberof Model
         */
        this.hashType = 'string';
        /**
         * The name of the index to use when running an `index` operation. By default
         * if will be called `byGSIK`. If the index is not created before hand, and
         * the model is configured with a `tenant`, then the method will fail.
         *
         * @type {string}
         * @memberof Model
         */
        this.indexName = 'byGSIK';
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
        this.maxGSIK = 10;
        /**
         * The type of the `range` key.
         *
         * @type {string}
         * @memberof Model
         */
        this.rangeType = 'string';
        /**
         * Value used to track the dates where modifications were done to the item.
         *
         * @type {boolean}
         * @memberof Model
         */
        this.track = false;
        this.table = config.table;
        this.documentClient = config.documentClient;
        this.hash = config.hash;
        if (config.hashType !== undefined)
            this.hashType = config.hashType;
        var configStruct = Object.assign({}, config.struct, { [this.hash]: this.hashType });
        if (config.range !== undefined) {
            this.range = config.range;
            if (config.rangeType !== undefined)
                this.rangeType = config.rangeType;
            configStruct[this.range] = this.rangeType;
        }
        if (config.track !== undefined) {
            this.track = config.track;
            configStruct.createdAt = 'string';
            configStruct.updatedAt = 'string';
        }
        this.struct = superstruct_1.struct(configStruct);
        if (config.tenant !== undefined) {
            this.tenant = config.tenant;
            this.hasTenantRegExp = new RegExp(`^${this.tenant}|`);
            if (config.maxGSIK !== undefined)
                this.maxGSIK = config.maxGSIK;
        }
        if (config.indexName !== undefined) {
            this.indexName = config.indexName;
        }
    }
    /**
     * Tracks the updatedAt and createdAt values.
     *
     * @param {IItem} body Update object body
     * @returns {IDynamoDBModelTrack} Track body object,
     * @memberof Model
     */
    trackChanges(body) {
        if (this.track === false)
            return {};
        var isoDate = new Date().toISOString();
        var isNew = body[this.hash] === undefined;
        var result = {
            updatedAt: isoDate
        };
        if (isNew === true)
            result.createdAt = isoDate;
        return result;
    }
    /**
     * Returns a valid key from an IDynamoDBKey like object.
     *
     * @param {IDynamoDBKey} key IDynamoDBKey like object.
     * @returns {IDynamoDBKey} Valid IDynamoDBKey
     * @memberof Model
     */
    getKey(key) {
        key = lodash_1.pick(key, this.hash, this.range || '');
        this.addTenantToHashKey(key);
        return key;
    }
    /**
     * Adds the tenant information to the key.
     *
     * @param {IDynamoDBKey} key Object containing the DynamoDB key.
     * @returns {IDynamoDBKey} Object containing the DynamoDB key with plus the
     * tenant.
     * @memberof Model
     */
    addTenantToHashKey(key) {
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
    substringBy(length, predicate) {
        return (value) => predicate(value) === true ? value.substring(length) : value;
    }
    addTenant() {
        return this.tenant !== undefined && this.tenant !== ''
            ? {
                gsik: this.tenant + '|' + Math.floor(Math.random() * this.maxGSIK)
            }
            : {};
    }
    removeTenantFromItem(item, substring) {
        item[this.hash] = substring(item[this.hash]);
        if (item.gsik !== undefined)
            delete item.gsik;
        return item;
    }
    removeTenant(items) {
        if (this.tenant === undefined)
            return items;
        var regexp = this.hasTenantRegExp || new RegExp(`^${this.tenant}|`);
        var length = this.tenant.length + 1 || 0;
        var substringIfTenantPrefix = this.substringBy(length, (value) => value !== undefined && regexp.test(value) === true);
        if (Array.isArray(items))
            return items.map((item) => this.removeTenantFromItem(item, substringIfTenantPrefix));
        return this.removeTenantFromItem(items, substringIfTenantPrefix);
    }
    validate(body) {
        return this.struct(body);
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map