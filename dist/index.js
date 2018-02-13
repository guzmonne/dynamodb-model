"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DynamoDB Model
 */
const lodash_1 = require("lodash");
const aws_sdk_1 = require("aws-sdk");
class DynamoDBModel {
    constructor(config) {
        this.calls = [];
        config = Object.assign({}, DynamoDBModel.global, config);
        this.documentClient =
            config.documentClient || new aws_sdk_1.DynamoDB.DocumentClient();
        this.tenant = config.tenant || '';
        this.table = config.table || '';
        this.hash = config.hash;
        if (config.range !== undefined)
            this.range = config.range;
    }
    static config(config) {
        this.global = Object.assign({}, this.global, config);
    }
    getKey(key) {
        key = lodash_1.pick(key, this.hash, this.range || '');
        key[this.hash] = [this.tenant, key[this.hash]]
            .filter(x => x !== undefined)
            .join('|');
        return key;
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
                this.data = data;
                callback(null);
            });
        this.calls.push(() => call.promise());
        return this;
    }
}
DynamoDBModel.global = {};
exports.DynamoDBModel = DynamoDBModel;
//# sourceMappingURL=index.js.map