"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const complex_model_1 = require("./complex_model");
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
    function createComplexModel(config) {
        config = Object.assign({}, global, config);
        class DynamoDBComplexModel extends complex_model_1.ComplexModel {
            constructor() {
                super(config);
            }
        }
        return function () {
            return new DynamoDBComplexModel();
        };
    }
    DynamoDBModel.createComplexModel = createComplexModel;
})(DynamoDBModel = exports.DynamoDBModel || (exports.DynamoDBModel = {}));
//# sourceMappingURL=index.js.map