import * as sinon from 'sinon';
import * as cuid from 'cuid';
import { btoa } from '../src/utils';
import { DynamoDB, config as AWSConfig } from 'aws-sdk';
import { SimpleModel } from '../src/simple_model';
import { DynamoDBModel } from '../src/';
import { IDynamoDBModelConfig } from '../src/model';

AWSConfig.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

var tenant = '1234';
var table = 'TableTest';
var config: IDynamoDBModelConfig = {
  documentClient: db,
  hash: 'id',
  table,
  tenant,
  struct: {
    name: 'string',
    age: 'number?'
  },
  maxGSIK: 1
};
var TestModel = DynamoDBModel.createSimpleModel(config);

var id = cuid();
var name = cuid();

describe('SimpleModel', () => {
  test('should be a function', () => {
    expect(typeof SimpleModel).toBe('function');
  });

  test('should be an instance of SimpleModel', () => {
    expect(TestModel() instanceof SimpleModel).toBe(true);
  });

  describe('#promise()', () => {
    test('should be a function', () => {
      expect(typeof TestModel().promise).toBe('function');
    });

    test('should return a promise', () => {
      expect(TestModel().promise() instanceof Promise).toBe(true);
    });
  });

  describe('#callback()', () => {
    test('should be a function', () => {
      expect(typeof TestModel().callback).toBe('function');
    });

    test('should call the callback function', done => {
      TestModel().callback(err => {
        expect(err).toBe(null);
        done();
      });
    });
  });

  describe('#create()', () => {
    var putStub: sinon.SinonStub;
    var name = 'SomeName';

    beforeEach(() => {
      putStub = sinon.stub(db, 'put');
      putStub.returns({
        promise: () => Promise.resolve({})
      });
    });

    afterEach(() => {
      putStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().create).toBe('function');
    });

    test('should configure a call to the `documentClient.put` function', () => {
      return TestModel()
        .create({ id, name })
        .promise()
        .then(() => {
          expect(putStub.calledOnce).toBe(true);
        });
    });

    test('should call the `documentClient.put` function with appropiate params', () => {
      return TestModel()
        .create({ id, name })
        .promise()
        .then(() => {
          expect(putStub.args[0][0]).toEqual({
            TableName: table,
            Item: {
              id: tenant + '|' + id,
              name,
              gsik: tenant + '|0'
            }
          });
        });
    });

    test('should return the created item', () => {
      return TestModel()
        .create({ id, name })
        .promise()
        .then(data => {
          expect(data).toEqual({ id, name });
        });
    });

    test('should add a random `hash` id value if undefined', () => {
      return TestModel()
        .create({ name })
        .promise()
        .then(data => {
          expect(data && !!data.id).toEqual(true);
        });
    });

    test('should add a `createdAt` and `updatedAt` values if `track` is true', () => {
      var TestModel = DynamoDBModel.createSimpleModel({
        ...config,
        track: true
      });
      return TestModel()
        .create({ name })
        .promise()
        .then(data => {
          data || (data = {});
          expect(!!data.createdAt).toEqual(true);
          expect(!!data.updatedAt).toEqual(true);
          expect(data.createdAt === data.updatedAt).toEqual(true);
        });
    });

    test('should only allow values defined on the schema', () => {
      return TestModel()
        .create({ id, name, gender: 'm' })
        .promise()
        .then(data => {
          expect(putStub.callCount).toBe(1);
          expect(data).toEqual({ id, name });
        });
    });

    test('should throw an error if a required value is missing', done => {
      var age = 12;
      TestModel()
        .create({ age })
        .callback((err, data) => {
          expect(data && data.age).not.toBe(age);
          expect(putStub.callCount).toBe(0);
          expect(err).not.toBe(null);
          expect(err.message).toEqual(
            'Expected a value of type `string` for `name` but received `undefined`.'
          );
          done();
        });
    });

    test('should add the `gsik` value to the item', done => {
      TestModel()
        .create({ name })
        .callback((err, data) => {
          expect(err).not.toBe(null);
          expect(putStub.callCount).toBe(1);
          expect(data && data.tenant).toBe(undefined);
          expect(putStub.args[0][0].Item.gsik).toBe(tenant + '|0');
          done();
        });
    });
  });

  describe('#delete()', () => {
    var deleteStub: sinon.SinonStub;

    beforeEach(() => {
      deleteStub = sinon.stub(db, 'delete');
      deleteStub.returns({
        promise: () => Promise.resolve({})
      });
    });

    afterEach(() => {
      deleteStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().delete).toBe('function');
    });

    test('should call the `documentClient.delete` method with appropiate params', () => {
      return TestModel()
        .delete({ id })
        .promise()
        .then(() => {
          expect(deleteStub.args[0][0]).toEqual({
            TableName: table,
            Key: {
              id: tenant + '|' + id
            }
          });
        });
    });

    test('should handle an error with the `documentClient.delete` method', () => {
      deleteStub.restore();
      deleteStub = sinon.stub(db, 'delete');
      deleteStub.callsFake(() => {
        throw new Error('Error with `documentClient.delete` method');
      });

      return TestModel()
        .delete({ id })
        .promise()
        .catch(error => {
          expect(error).not.toBe(null);
          expect(error.message).toBe(
            'Error with `documentClient.delete` method'
          );
        });
    });

    test('should handle an error with the `documentClient.delete` method', done => {
      deleteStub.restore();
      deleteStub = sinon.stub(db, 'delete');
      deleteStub.callsFake(() => {
        throw new Error('Error with `documentClient.delete` method');
      });

      return TestModel()
        .delete({ id })
        .callback(error => {
          expect(error).not.toBe(null);
          expect(error.message).toBe(
            'Error with `documentClient.delete` method'
          );
          done();
        });
    });
  });

  describe('#update()', () => {
    var updateStub: sinon.SinonStub;

    beforeEach(() => {
      updateStub = sinon.stub(db, 'update');
      updateStub.returns({
        promise: () => Promise.resolve({})
      });
    });

    afterEach(() => {
      updateStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().update).toBe('function');
    });

    test('should call the `documentClient.update` function', () => {
      return TestModel()
        .update({ id, age: 12 })
        .promise()
        .then(() => {
          expect(updateStub.calledOnce).toBe(true);
        });
    });

    test('should call the `documentClient.update` with valid params', () => {
      var age = 12;
      return TestModel()
        .update({ id, age })
        .promise()
        .then(() => {
          expect(updateStub.args[0][0]).toEqual({
            TableName: table,
            Key: {
              id: tenant + '|' + id
            },
            UpdateExpression: '#age = :age',
            ExpressionAttributeNames: {
              '#age': 'age'
            },
            ExpressionAttributeValues: {
              ':age': age
            }
          });
        });
    });

    test('should throw an error if the body is invalid', done => {
      TestModel()
        .update({ id, age: '12' })
        .callback((error, data) => {
          expect(error).not.toBe(null);
          expect(data).toBe(undefined);
          expect(error.message).toBe(
            'Expected a value of type `number | undefined` for `age` but received `"12"`.'
          );
          done();
        });
    });

    test('should add an `updatedAt` value if `track` is `true`', done => {
      var _config = { ...config, track: true };
      var TestModel = DynamoDBModel.createSimpleModel(_config);

      TestModel()
        .update({ id, name })
        .callback((error, data) => {
          expect(error).toBe(null);
          expect(data).not.toBe(undefined);
          expect(data && typeof data.updatedAt).toBe('string');
          done();
        });
    });

    test('should fail if the hash key is missing', done => {
      TestModel()
        .update({ name })
        .callback((error, data) => {
          expect(data).toBe(undefined);
          expect(error).not.toBe(null);
          expect(error.message).toBe("The value of 'id' can't be undefined");
          done();
        });
    });

    test('should fail if the range key is missing', done => {
      var TestModel = DynamoDBModel.createSimpleModel({
        ...config,
        range: 'username'
      });

      TestModel()
        .update({ id, name })
        .callback((error, data) => {
          expect(data).toBe(undefined);
          expect(error).not.toBe(null);
          expect(error.message).toBe(
            "The value of 'username' can't be undefined"
          );
          done();
        });
    });

    test('should construct the `UpdateExpression` param correctly', done => {
      var age = 12;
      return TestModel()
        .update({ id, age, name })
        .promise()
        .then(() => {
          var params = updateStub.args[0][0];
          expect(params.UpdateExpression).toEqual('#name = :name,#age = :age');
          done();
        });
    });

    test('should construct the `ExpressionAttributeValues` correctly', done => {
      var age = 12;
      return TestModel()
        .update({ id, age, name })
        .promise()
        .then(() => {
          var params = updateStub.args[0][0];
          expect(params.ExpressionAttributeNames).toEqual({
            '#name': 'name',
            '#age': 'age'
          });
          done();
        });
    });

    test('should construct the `ExpressionAttributeNames` correctly', done => {
      var age = 12;
      return TestModel()
        .update({ id, age, name })
        .promise()
        .then(() => {
          var params = updateStub.args[0][0];
          expect(params.ExpressionAttributeValues).toEqual({
            ':name': name,
            ':age': age
          });
          done();
        });
    });
  });

  describe('#index()', () => {
    var scanStub: sinon.SinonStub;
    var queryStub: sinon.SinonStub;

    var NoTenantModel = DynamoDBModel.createSimpleModel({
      ...config,
      tenant: undefined
    });

    beforeEach(() => {
      var i = -1;
      scanStub = sinon.stub(db, 'scan');
      queryStub = sinon.stub(db, 'query');

      scanStub.returns({
        promise: () =>
          Promise.resolve({
            Items: [
              {
                id,
                name
              }
            ],
            LastEvaluatedKey: {
              id
            },
            Count: 1
          })
      });

      queryStub.callsFake(() => {
        i++;
        return {
          promise: () =>
            Promise.resolve({
              Items: [
                {
                  id: tenant + '|' + id,
                  name: name + '|' + i,
                  gsik: tenant + '|0'
                }
              ],
              LastEvaluatedKey: {
                id: tenant + '|' + id,
                name: name + '|' + i,
                gsik: tenant + '|0'
              },
              Count: 1
            })
        };
      });
    });

    afterEach(() => {
      scanStub.restore();
      queryStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().index).toBe('function');
    });

    test("should call the `documentClient.scan` method if the model doesn't has a `tenant` configured", done => {
      NoTenantModel()
        .index({})
        .callback(err => {
          expect(queryStub.callCount).toBe(0);
          expect(scanStub.calledOnce).toBe(true);
          expect(err).toBe(null);
          done();
        });
    });

    test('should return the items without the `tenant` information', done => {
      TestModel()
        .index({})
        .callback((err, data) => {
          expect(err).toBe(null);
          expect(data).toEqual({
            count: 1,
            items: [
              {
                id,
                name: name + '|0'
              }
            ],
            offset: JSON.stringify({ id, name: name + '|0' })
          });
          done();
        });
    });

    test('should call the `documentClient.query` method if the model has a `tenant` configured', done => {
      var maxGSIK = Math.floor(Math.random() * 100);
      var TestModel = DynamoDBModel.createSimpleModel({
        ...config,
        maxGSIK
      });
      TestModel()
        .index({})
        .callback(err => {
          expect(scanStub.callCount).toBe(0);
          expect(queryStub.callCount).toBe(maxGSIK);
          expect(err).toBe(null);
          done();
        });
    });

    test('should call the `documentClient.scan` method with appropiate params', done => {
      NoTenantModel()
        .index()
        .callback(() => {
          expect(scanStub.args[0][0]).toEqual({
            TableName: table,
            Limit: 100
          });
          done();
        });
    });

    test('should allow to configure the `Limit` value', done => {
      NoTenantModel()
        .index({ limit: 200 })
        .callback(() => {
          expect(scanStub.args[0][0]).toEqual({
            TableName: table,
            Limit: 200
          });
          done();
        });
    });

    test('should convert the offset from base64 to a DynamoDBKey when tenant is undefined', done => {
      NoTenantModel()
        .index({ limit: 200, offset: btoa(JSON.stringify({ id })) })
        .callback(() => {
          expect(scanStub.args[0][0]).toEqual({
            TableName: table,
            Limit: 200,
            ExclusiveStartKey: {
              id
            }
          });
          done();
        });
    });

    test('should return the `offset` value as a base64 string when tenant is undefined', () => {
      return NoTenantModel()
        .index({ limit: 200, offset: btoa(JSON.stringify({ id })) })
        .promise()
        .then(data => {
          expect(data && data.offset).toBe(btoa(JSON.stringify({ id })));
        });
    });

    test('should convert the offset from base64 to a DynamoDBKey when tenant is not undefined', done => {
      TestModel()
        .index({ limit: 200, offset: btoa(JSON.stringify({ id })) })
        .callback(() => {
          expect(queryStub.args[0][0]).toEqual({
            TableName: table,
            IndexName: 'byGSIK',
            KeyConditionExpression: `#gsik = :gsik`,
            ExpressionAttributeNames: {
              '#gsik': 'gsik'
            },
            ExpressionAttributeValues: {
              ':gsik': tenant + '|0'
            },
            Limit: 200,
            ExclusiveStartKey: {
              id: tenant + '|' + id
            }
          });
          done();
        });
    });

    test('should use the configured index name when tenant is not undefined', done => {
      var indexName = 'SomeIndexName';
      var TestModel = DynamoDBModel.createSimpleModel({
        ...config,
        indexName
      });

      TestModel()
        .index({ limit: 200, offset: btoa(JSON.stringify({ id })) })
        .callback(() => {
          expect(queryStub.args[0][0]).toEqual({
            TableName: table,
            IndexName: indexName,
            KeyConditionExpression: `#gsik = :gsik`,
            ExpressionAttributeNames: {
              '#gsik': 'gsik'
            },
            ExpressionAttributeValues: {
              ':gsik': tenant + '|0'
            },
            Limit: 200,
            ExclusiveStartKey: {
              id: tenant + '|' + id
            }
          });
          done();
        });
    });
  });

  describe('#get()', () => {
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      getStub.returns({
        promise: () => Promise.resolve({ Item: { id, name } })
      });
    });

    afterEach(() => {
      getStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().get).toBe('function');
    });

    test('should configure a call to the `documentClient.get` function', () => {
      return TestModel()
        .get({ id })
        .promise()
        .then(() => {
          expect(getStub.calledOnce).toBe(true);
        });
    });

    test('should call the `documentClient.get` function with appropiate params', () => {
      return TestModel()
        .get({ id })
        .promise()
        .then(() => {
          expect(getStub.args[0][0]).toEqual({
            TableName: table,
            Key: {
              id: tenant + '|' + id
            }
          });
        });
    });

    test('should return the item', () => {
      return TestModel()
        .get({ id })
        .promise()
        .then(data => {
          expect(data).toEqual({ id, name });
        });
    });
  });
});
