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
/**
 * Default Model
 * ===
 *
 * This basic model has some basic methods to interact with DynamoDB. It has
 * implemented all the typical `CRUD` operations, and translates them into
 * DynamoDB DocumentClient calls. By using a model, you can avoid having to
 * learn how to work with DynamoDB.
 *
 * If you want to add more methods to your model, you can create your own class
 * extended from this one.
 */
class DefaultModel extends model_1.Model {
    constructor(config) {
        super(config);
        /**
         * DynamoDB Document Client call. You can call it by using the `callback` or
         * `promise` method.
         */
        this.call = () => Promise.resolve();
    }
    /**
     * Helper function to handle errors lazily. This way the user can handle
     * them through the `callback` or `promise` api.
     * @param error Error thrown during a method call.
     */
    handleError(error) {
        this.call = () => Promise.reject(error);
        return this;
    }
    /**
     * Creates the `UpdateExpression`, `ExpressionAttributeNames` and
     * `ExpressionAttributeValues` for the `documentClient.update` method params.
     * @param body Body if the item to be stored.
     */
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
    /**
     * Does the stored DynamoDB DocumentClient call and wraps the result in
     * promise. It handles error produced on the call.
     */
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
    /**
     * Does the stored DynamoDB DocumentClient call and wraps the result in a
     * callback. It handles error produced on the call, and passes the onto the
     * callback on the `err` argument.
     * @param callback Callback function to invoke with the data or the error
     * generated on the DynamoDB DocumentClient call.
     */
    callback(callback) {
        this.promise()
            .then(data => callback(null, data))
            .catch(err => callback(err));
    }
    /**
     * Sets up a call to DynamoDB to create a new item.
     * @param body Body of the item to be created.
     */
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
    /**
     * Sets a call to DynamoDB to update an item.
     * @param body Body of the item to be updated.
     */
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
    /**
     * Sets a call to get an item from DynamoDB.
     * @param key Item key.
     */
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
    /**
     * Sets a call to DynamoDB to delete an item.
     * @param key Item key.
     */
    delete(key) {
        this.call = () => this.documentClient
            .delete({
            TableName: this.table,
            Key: this.getKey(key)
        })
            .promise();
        return this;
    }
    /**
     * Sets a call to scan the DynamoDB table according to the provided options.
     * @param options Index options used to define what items to return.
     */
    scan(options) {
        this.call = () => this.documentClient
            .scan(Object.assign({ TableName: this.table }, (options.limit !== undefined ? { Limit: options.limit } : {}), (options.offset !== undefined
            ? { ExclusiveStartKey: JSON.parse(utils_1.atob(options.offset)) }
            : {})))
            .promise()
            .then(data => {
            return Object.assign({ items: data.Items, count: data.Count }, (data.LastEvaluatedKey !== undefined
                ? { offset: utils_1.btoa(JSON.stringify(data.LastEvaluatedKey)) }
                : {}));
        });
        return this;
    }
    /**
     * Sets a call to query the DynamoDB table according to the provided options.
     * @param options Index options used to define what items to return.
     */
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
                    ExclusiveStartKey: this.getKey(JSON.parse(utils_1.atob(options.offset))[i])
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
        })).then((results) => {
            var response = results.reduce((acc, result) => (Object.assign({}, acc, { items: acc.items.concat(this.removeTenant(result.items) || []), count: acc.count + result.count }, (result.offset !== undefined
                ? {
                    offset: acc.offset !== undefined
                        ? acc.offset + '|' + result.offset
                        : result.offset
                }
                : {}))), {
                items: [],
                count: 0,
                offset: undefined
            });
            if (response.offset)
                response.offset = utils_1.btoa(response.offset);
            return response;
        });
        return this;
    }
    /**
     * Sets a call to DynamoDB to get a list of items.
     * @param options Index options used to set what items to return.
     */
    index(options) {
        options = Object.assign({ limit: 100 }, options);
        if (this.tenant === undefined)
            return this.scan(options);
        return this.query(options);
    }
}
exports.DefaultModel = DefaultModel;
//# sourceMappingURL=default_model.js.map