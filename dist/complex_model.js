"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cuid = require("cuid");
const lodash_1 = require("lodash");
const model_1 = require("./model");
class ComplexModel extends model_1.Model {
    constructor(config) {
        super(config);
        this.calls = [];
    }
    handleValidationError(err, callback) {
        if (typeof callback === 'function')
            return callback(err);
        this.calls.push(() => {
            throw err;
        });
        return this;
    }
    delete(key, callback) {
        var call = this.documentClient.delete({
            TableName: this.table,
            Key: this.addTenant(key)
        });
        if (typeof callback === 'function')
            return call.send(err => {
                if (err !== null)
                    return callback(err);
                callback(null);
            });
        this.calls.push(() => call
            .promise()
            .then(() => ({
            items: []
        }))
            .catch(err => {
            throw err;
        }));
    }
    get(key, callback) {
        var call = this.documentClient.get({
            TableName: this.table,
            Key: this.addTenant(key)
        });
        if (typeof callback === 'function')
            return call.send((err, data) => {
                if (err !== null)
                    return callback(err);
                this.data.push(this.removeTenant(data));
                callback(null);
            });
        this.calls.push(() => call
            .promise()
            .then((data) => {
            var items = data.Item === undefined ? [] : [this.removeTenant(data.Item)];
            return { items };
        })
            .catch(err => {
            throw err;
        }));
        return this;
    }
    create(body, callback) {
        if (body[this.hash] === undefined)
            body[this.hash] = cuid();
        try {
            this.validate(body);
        }
        catch (err) {
            return this.handleValidationError(err, callback);
        }
        body = Object.assign({}, lodash_1.pick(body, Object.keys(this.schema), this.hash, this.range || ''), this.trackChanges(body));
        var params = {
            TableName: this.table,
            Item: Object.assign({}, body, this.addTenant(body))
        };
        var call = this.documentClient.put(params);
        if (typeof callback === 'function')
            return call.send(err => {
                if (err !== null)
                    return callback(err);
                this.data.push(body);
                callback(null);
            });
        this.calls.push(() => call
            .promise()
            .then(() => ({
            items: [body]
        }))
            .catch(err => {
            throw err;
        }));
        return this;
    }
    /*
    set(body: IItem): IDynamoDBModel;
    set(body: IItem, callback: (error: Error | null) => void): void;
    set(body: IItem, callback?: (error: Error | null) => void): void {
      var call = this.documentClient.update({
        TableName: this.table,
        Key: this.addTenant(body as IDynamoDBKey),
        UpdateExpression: '#name = :name',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': 'John Doe'
        }
      });
  
      if (typeof callback === 'function')
        return call.send(err => {
          if (err !== null) return callback(err);
          callback(null);
        });
  
      return this as IDynamoDBModel;
    }
  */
    promise() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let call of this.calls) {
                var result = yield call();
                this.data = result.items;
            }
        });
    }
}
exports.ComplexModel = ComplexModel;
//# sourceMappingURL=complex_model.js.map