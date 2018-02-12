"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DynamoDB Model
 */
const aws_sdk_1 = require("aws-sdk");
class DynamoDBModel {
    constructor(config) {
        this.calls = [];
        config = Object.assign({}, DynamoDBModel.global, config);
        this.documentClient = new aws_sdk_1.DynamoDB.DocumentClient();
        this.tenant = config.tenant || '';
        this.table = config.table || '';
    }
    static config(config) {
        this.global = Object.assign({}, this.global, config);
    }
    get(key, callback) {
        var call = this.documentClient.get({
            TableName: this.table,
            Key: key
        });
        if (typeof callback === 'function')
            call.send((err, data) => {
            });
        return this;
    }
}
DynamoDBModel.global = {
    table: '',
    tenant: '',
    documentClient: new aws_sdk_1.DynamoDB.DocumentClient()
};
exports.DynamoDBModel = DynamoDBModel;
//# sourceMappingURL=index.js.map