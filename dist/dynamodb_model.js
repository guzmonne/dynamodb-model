"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Model {
    get() { }
}
exports.Model = Model;
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
    function create() {
        class NewModel extends Model {
            constructor() {
                super();
            }
        }
        return function () {
            return new NewModel();
        };
    }
    DynamoDBModel.create = create;
})(DynamoDBModel = exports.DynamoDBModel || (exports.DynamoDBModel = {}));
//# sourceMappingURL=dynamodb_model.js.map