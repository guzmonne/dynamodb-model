"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const cuid = require("cuid");
class Model {
    constructor(config) {
        this.data = [];
        this.track = false;
        this.calls = [];
        this.hash = config.hash;
        this.table = config.table;
        this.documentClient = config.documentClient;
        this.schema = config.schema;
        if (config.track !== undefined)
            this.track = config.track;
        if (config.range !== undefined)
            this.range = config.range;
        if (config.tenant !== undefined)
            this.tenant = config.tenant;
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
    getKey(key) {
        key = lodash_1.pick(key, this.hash, this.range || '');
        key[this.hash] = [this.tenant, key[this.hash]]
            .filter(x => x !== undefined)
            .join('|');
        return key;
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
        if (this.range !== undefined && body[this.range] === undefined)
            throw new Error(`The range key \`${this.range}\` can' be undefined.`);
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
    handleValidationError(err, callback) {
        if (typeof callback === 'function')
            return callback(err);
        this.calls.push(() => {
            throw err;
        });
        return this;
    }
    create(body, callback) {
        if (body[this.hash] === undefined)
            body[this.hash] = cuid();
        try {
            this.validate(body);
        }
        catch (err) {
            return this.handleValidationError(err, callback);
        }
        body = Object.assign({}, lodash_1.pick(body, Object.keys(this.schema)), this.trackChanges(body), this.getKey(body));
        var call = this.documentClient.put({
            TableName: this.table,
            Item: body
        });
        if (typeof callback === 'function')
            return call.send(err => {
                if (err !== null)
                    return callback(err);
                this.data.push(body);
                this.removeTenantData();
                callback(null);
            });
        this.calls.push(() => call
            .promise()
            .then(() => ({
            items: [body],
            count: 1
        }))
            .catch(err => {
            throw err;
        }));
        return this;
    }
    get(key, callback) {
        var call = this.documentClient.get({
            TableName: this.table,
            Key: this.getKey(key)
        });
        if (typeof callback === 'function')
            return call.send((err, data) => {
                if (err !== null)
                    return callback(err);
                this.data.push(data);
                callback(null);
            });
        this.calls.push(() => call
            .promise()
            .then((data) => ({
            items: data.Item === undefined ? [] : [data.Item],
            count: data.Item === undefined ? 0 : 1
        }))
            .catch(err => {
            throw err;
        }));
        return this;
    }
    removeTenantData() {
        if (this.tenant === undefined || this.tenant === '')
            return;
        this.data = this.data.map(d => {
            if (d[this.hash] !== undefined) {
                var tenant = this.tenant || '';
                var length = tenant.length + 1 || 0;
                d[this.hash] = d[this.hash].substring(length);
            }
            return d;
        });
    }
    promise() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let call of this.calls) {
                var result = yield call();
                this.data = result.items;
            }
            this.removeTenantData();
        });
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map