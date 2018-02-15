"use strict";
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
    promise() {
        return this.call();
    }
    callback(callback) {
        this.call()
            .then(data => callback(null, data))
            .catch(err => callback(err));
    }
    create(body) {
        if (body[this.hash] === undefined)
            body[this.hash] = cuid();
        body = lodash_1.pick(body, Object.keys(this.struct.schema));
        if (this.track === true)
            body = Object.assign({}, body, this.trackChanges(body));
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
}
exports.SimpleModel = SimpleModel;
//# sourceMappingURL=simple_model.js.map