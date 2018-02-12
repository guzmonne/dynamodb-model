"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DynamoDB Model
 */
const aws_sdk_1 = require("aws-sdk");
class DynamoDBModel {
    constructor(config) {
        if (config.documentClient !== undefined)
            DynamoDBModel.documentClient = new aws_sdk_1.DynamoDB.DocumentClient();
        if (config.tenant !== undefined)
            DynamoDBModel.tenant = config.tenant;
        if (config.table !== undefined)
            DynamoDBModel.table = config.table;
    }
    static config(config) {
        if (config.documentClient !== undefined)
            this.documentClient = config.documentClient;
        if (config.tenant !== undefined)
            this.tenant = config.tenant;
        if (config.table !== undefined)
            this.table = config.table;
    }
    get(id) {
        console.log(id);
        return this;
    }
}
DynamoDBModel.tenant = '';
DynamoDBModel.documentClient = new aws_sdk_1.DynamoDB.DocumentClient();
exports.DynamoDBModel = DynamoDBModel;
//# sourceMappingURL=index.js.map