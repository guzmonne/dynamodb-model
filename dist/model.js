"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class Model {
    constructor(config) {
        this.data = [];
        this.track = false;
        this.hash = config.hash;
        this.table = config.table;
        this.documentClient = config.documentClient;
        this.schema = config.schema;
        if (config.track !== undefined)
            this.track = config.track;
        if (config.range !== undefined)
            this.range = config.range;
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
    validateType(value, key, type) {
        var error;
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
                error = lodash_1.isObject(value) === false;
                break;
            default:
                throw new Error(`Type ${type} is not a valid schema type`);
        }
        if (error === true)
            throw new Error(`The value of \`${key}\` should be a ${type}`);
    }
    validateRequired(value, key, required) {
        if (value === undefined && required === true)
            throw new Error(`The attribute \`${key}\` is required.`);
    }
    validate(body) {
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
exports.Model = Model;
//# sourceMappingURL=model.js.map