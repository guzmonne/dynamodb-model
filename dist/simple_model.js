"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
class SimpleModel extends model_1.Model {
    constructor(config) {
        super(config);
        this.call = () => Promise.resolve();
    }
    get(key) {
        this.documentClient.get({
            TableName: this.table,
            Key: key
        });
        return this;
    }
}
exports.SimpleModel = SimpleModel;
//# sourceMappingURL=simple_model.js.map