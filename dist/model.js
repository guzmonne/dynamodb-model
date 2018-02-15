"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superstruct_1 = require("superstruct");
const lodash_1 = require("lodash");
class Model {
    constructor(config) {
        this.data = [];
        this.hashType = 'string';
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
        }
    }
    trackChanges(body) {
        if (this.track === false)
            return {};
        var isoDate = new Date().toISOString();
        var isNew = body[this.hash] !== undefined;
        var result = {
            updatedAt: isoDate
        };
        if (isNew === true)
            result.createdAt = isoDate;
        return result;
    }
    addTenant(key) {
        key = lodash_1.pick(key, this.hash, this.range || '');
        key[this.hash] = [this.tenant, key[this.hash]]
            .filter(x => x !== undefined)
            .join('|');
        return key;
    }
    substringBy(length, predicate) {
        return (value) => predicate(value) === true ? value.substring(length) : value;
    }
    removeTenant(items) {
        if (this.tenant === undefined)
            return items;
        var regexp = this.hasTenantRegExp || new RegExp(`^${this.tenant}|`);
        var length = this.tenant.length + 1 || 0;
        var substringIfTenantPrefix = this.substringBy(length, (value) => value !== undefined && regexp.test(value) === true);
        if (Array.isArray(items))
            return items.map((item) => {
                item[this.hash] = substringIfTenantPrefix(item[this.hash]);
                return item;
            });
        items[this.hash] = substringIfTenantPrefix(items[this.hash]);
        return items;
    }
    validate(body) {
        return this.struct(body);
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map