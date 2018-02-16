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
const lodash_1 = require("lodash");
const model_1 = require("./model");
class SimpleModel extends model_1.Model {
    constructor(config) {
        super(config);
        this.call = () => Promise.resolve();
    }
    handleError(error) {
        this.call = () => Promise.reject(error);
        return this;
    }
    createUpdateExpression(body) {
        return {
            UpdateExpression: JSON.stringify(body),
            ExpressionAttributeNames: {},
            ExpressionAttributeValues: {}
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
            Item: Object.assign({}, body, this.addTenant(body))
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
            .update(Object.assign({ TableName: this.table, Key: this.addTenant(body) }, this.createUpdateExpression(body)))
            .promise()
            .then(() => body);
        return this;
    }
    get(key) {
        this.call = () => this.documentClient
            .get({
            TableName: this.table,
            Key: this.addTenant(key)
        })
            .promise()
            .then(data => data.Item);
        return this;
    }
    delete(key) {
        this.call = () => this.documentClient
            .delete({
            TableName: this.table,
            Key: this.addTenant(key)
        })
            .promise();
        return this;
    }
}
exports.SimpleModel = SimpleModel;
//# sourceMappingURL=simple_model.js.map