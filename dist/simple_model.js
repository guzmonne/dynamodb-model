"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
class SimpleModel extends model_1.Model {
    constructor(config) {
        super(config);
        this.call = () => Promise.resolve();
    }
    promise() {
        return this.call();
    }
    callback(callback) {
        this.call()
            .then(data => callback(null, data))
            .catch(err => callback(err));
    }
    get(key) {
        var call = this.documentClient.get({
            TableName: this.table,
            Key: this.addTenant(key)
        });
        this.call = () => call.promise().then(data => data.Item);
        return this;
    }
}
exports.SimpleModel = SimpleModel;
//# sourceMappingURL=simple_model.js.map