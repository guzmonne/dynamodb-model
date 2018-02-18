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
const cuid = require("cuid");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const model_1 = require("./model");
class DefaultModel extends model_1.Model {
    constructor(config) {
        super(config);
        this.call = () => Promise.resolve();
    }
    handleError(error) {
        this.call = () => Promise.reject(error);
        return this;
    }
    createUpdateExpressionParams(body) {
        body = lodash_1.omit(body, this.range !== undefined ? [this.hash, this.range] : this.hash);
        var expressions = [], attributeNames = {}, attributeValues = {};
        for (var key in body) {
            expressions.push(`#${key} = :${key}`);
            attributeNames[`#${key}`] = key;
            attributeValues[`:${key}`] = body[key];
        }
        if (expressions.length === 0)
            throw new Error(`Can't construct UpdateExpression from the body`);
        expressions = [`SET ${expressions[0]}`].concat(expressions.slice(1, expressions.length));
        return {
            UpdateExpression: expressions.join(', '),
            ExpressionAttributeNames: attributeNames,
            ExpressionAttributeValues: attributeValues
        };
    }
    promise() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.call();
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    callback(callback) {
        this.promise()
            .then(data => callback(null, data))
            .catch(err => callback(err));
    }
    create(body) {
        body = lodash_1.pick(body, Object.keys(this.struct.schema));
        if (this.track === true)
            body = Object.assign({}, body, this.trackChanges(body));
        if (body[this.hash] === undefined)
            body[this.hash] = cuid();
        try {
            this.validate(body);
        }
        catch (error) {
            return this.handleError(error);
        }
        this.call = () => this.documentClient
            .put({
            TableName: this.table,
            Item: Object.assign({}, body, this.getKey(body), this.addTenant())
        })
            .promise()
            .then(() => body);
        return this;
    }
    update(body) {
        if (body[this.hash] === undefined)
            return this.handleError(new Error(`The value of '${this.hash}' can't be undefined`));
        if (this.range !== undefined && body[this.range] === undefined)
            return this.handleError(new Error(`The value of '${this.range}' can't be undefined`));
        body = lodash_1.pick(body, Object.keys(this.struct.schema));
        if (this.track === true)
            body = Object.assign({}, body, this.trackChanges(body));
        try {
            this.validate(body);
        }
        catch (error) {
            if (error.value !== undefined)
                return this.handleError(error);
        }
        this.call = () => this.documentClient
            .update(Object.assign({ TableName: this.table, Key: this.getKey(body) }, this.createUpdateExpressionParams(body)))
            .promise()
            .then(() => body);
        return this;
    }
    get(key) {
        this.call = () => this.documentClient
            .get({
            TableName: this.table,
            Key: this.getKey(key)
        })
            .promise()
            .then(data => data.Item);
        return this;
    }
    delete(key) {
        this.call = () => this.documentClient
            .delete({
            TableName: this.table,
            Key: this.getKey(key)
        })
            .promise();
        return this;
    }
    scan(options) {
        this.call = () => this.documentClient
            .scan(Object.assign({ TableName: this.table }, (options.limit !== undefined ? { Limit: options.limit } : {}), (options.offset !== undefined
            ? { ExclusiveStartKey: JSON.parse(atob(options.offset)) }
            : {})))
            .promise()
            .then(data => {
            return Object.assign({ items: data.Items, count: data.Count }, (data.LastEvaluatedKey !== undefined
                ? { offset: utils_1.btoa(JSON.stringify(data.LastEvaluatedKey)) }
                : {}));
        });
        return this;
    }
    query(options) {
        this.call = () => Promise.all(lodash_1.range(0, this.maxGSIK).map(i => {
            var params = Object.assign({ TableName: this.table, IndexName: this.indexName, KeyConditionExpression: `#gsik = :gsik`, ExpressionAttributeNames: {
                    '#gsik': 'gsik'
                }, ExpressionAttributeValues: {
                    ':gsik': `${this.tenant}|${i}`
                } }, (options.limit !== undefined
                ? { Limit: Math.floor(options.limit / this.maxGSIK) }
                : {}), (options.offset !== undefined
                ? {
                    ExclusiveStartKey: this.getKey(JSON.parse(atob(options.offset)))
                }
                : {}));
            return this.documentClient
                .query(params)
                .promise()
                .then((data) => {
                return Object.assign({ items: data.Items || [], count: data.Count || 0 }, (data.LastEvaluatedKey !== undefined
                    ? {
                        offset: JSON.stringify(this.removeTenant(data.LastEvaluatedKey))
                    }
                    : {}));
            });
        })).then((results) => results.reduce((acc, result) => (Object.assign({}, acc, { items: acc.items.concat(this.removeTenant(result.items) || []), count: acc.count + result.count }, (result.offset !== undefined
            ? {
                offset: acc.offset !== undefined
                    ? acc.offset + '|' + result.offset
                    : result.offset
            }
            : {}))), {
            items: [],
            count: 0,
            offset: undefined
        }));
        return this;
    }
    index(options) {
        options = Object.assign({ limit: 100 }, options);
        if (this.tenant === undefined)
            return this.scan(options);
        return this.query(options);
    }
}
exports.DefaultModel = DefaultModel;
//# sourceMappingURL=default_model.js.map