"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superstruct_1 = require("superstruct");
const lodash_1 = require("lodash");
class Model {
    constructor(config) {
        this.data = [];
        this.hashType = 'string';
        this.indexName = 'byGSIK';
        this.maxGSIK = 10;
        this.rangeType = 'string';
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
            if (config.maxGSIK >= 0)
                this.maxGSIK = config.maxGSIK;
        }
        if (config.indexName !== undefined) {
            this.indexName = config.indexName;
        }
    }
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
    getKey(key) {
        key = lodash_1.pick(key, this.hash, this.range || '');
        key[this.hash] =
            this.tenant !== undefined
                ? this.tenant + '|' + key[this.hash]
                : key[this.hash];
        return key;
    }
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