"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_model_1 = require("./simple_model");
var global = {};
var DynamoDBModel;
(function (DynamoDBModel) {
    function getConfig() {
        return Object.assign({}, global);
    }
    DynamoDBModel.getConfig = getConfig;
    function config(options) {
        global = Object.assign({}, global, options);
    }
    DynamoDBModel.config = config;
    function create(config) {
        config = Object.assign({}, global, config);
        class DynamoDBComplexModel extends simple_model_1.SimpleModel {
            constructor() {
                super(config);
            }
        }
        return function () {
            return new DynamoDBComplexModel();
        };
    }
    DynamoDBModel.create = create;
})(DynamoDBModel = exports.DynamoDBModel || (exports.DynamoDBModel = {}));
//# sourceMappingURL=index.js.map