"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const default_model_1 = require("./default_model");
__export(require("./default_model"));
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
        var Model = createModel(config);
        return function () {
            return new Model();
        };
    }
    DynamoDBModel.create = create;
    function createModel(config) {
        config = Object.assign({}, global, config);
        class Model extends default_model_1.DefaultModel {
            constructor() {
                super(config);
            }
        }
        return Model;
    }
    DynamoDBModel.createModel = createModel;
    function extend(config, extendFn) {
        var Model = createModel(config);
        var ExtendedModel = extendFn(Model);
        return function () {
            return new ExtendedModel();
        };
    }
    DynamoDBModel.extend = extend;
})(DynamoDBModel = exports.DynamoDBModel || (exports.DynamoDBModel = {}));
//# sourceMappingURL=index.js.map