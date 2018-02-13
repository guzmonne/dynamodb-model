"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
var global = {};
var DynamoDBModel;
(function (DynamoDBModel_1) {
    function getConfig() {
        return Object.assign({}, global);
    }
    DynamoDBModel_1.getConfig = getConfig;
    function config(options) {
        global = Object.assign({}, global, options);
    }
    DynamoDBModel_1.config = config;
    function create(config) {
        config = Object.assign({}, global, config);
        class DynamoDBModel extends model_1.Model {
            constructor() {
                super(config);
            }
        }
        return function () {
            return new DynamoDBModel();
        };
    }
    DynamoDBModel_1.create = create;
})(DynamoDBModel = exports.DynamoDBModel || (exports.DynamoDBModel = {}));
//# sourceMappingURL=dynamodb_model.js.map