import { Model } from '../src/model';
import { DynamoDBModel } from '../src/';
import * as sinon from 'sinon';
import { DynamoDB, config } from 'aws-sdk';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

var tenant = '1234';
var table = 'TableTest';
var TestModel = DynamoDBModel.create({
  documentClient: db,
  hash: 'id',
  table,
  tenant,
  schema: {
    name: {
      type: 'string',
      required: true
    },
    age: { type: 'number' }
  }
});

describe('Model', () => {
  test('should be a function', () => {
    expect(typeof Model).toEqual('function');
    expect(typeof TestModel).toEqual('function');
  });

  var id = 'abcd';
  var name = 'Test';
  var data = { id, name };
  describe('#promise()', () => {
    var getStub: sinon.SinonStub;
    var putStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      putStub = sinon.stub(db, 'put');
      getStub.returns({
        promise: () =>
          Promise.resolve({ Item: { id: tenant + '|' + id, name } })
      });
      putStub.returns({
        promise: () => Promise.resolve({})
      });
    });

    afterEach(() => {
      getStub.restore();
      putStub.restore();
    });

    test('should be a function', () => {
      var model = TestModel();
      expect(typeof model.promise).toBe('function');
    });

    test('should set the `data` items on a get success', () => {
      var model = TestModel();
      return model
        .get({ id })
        .promise()
        .then(() => {
          expect(getStub.calledOnce).toBe(true);
          expect(model.data[0]).toEqual({
            id,
            name
          });
        });
    });
    test('should set the `data` items on a create success', () => {
      var model = TestModel();
      return model
        .create({ ...data })
        .promise()
        .then(() => {
          expect(putStub.calledOnce).toBe(true);
          expect(model.data[0]).toEqual({ id, name });
        });
    });

    test('should fail if the `data` to create is invalid', () => {
      var model = TestModel();
      return model
        .create({ data })
        .promise()
        .catch(err => {
          expect(putStub.calledOnce).toBe(false);
          expect(err.message).toEqual('The attribute `name` is required.');
        });
    });
  });

  describe('#delete()', () => {
    var deleteStub: sinon.SinonStub;

    beforeEach(() => {
      deleteStub = sinon.stub(db, 'delete');
      deleteStub.returns({
        send: callback => callback(null)
      });
    });

    afterEach(() => {
      deleteStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().delete).toEqual('function');
    });

    test('should return immediately if a callback is provided', done => {
      TestModel().delete({ id }, err => {
        expect(err).toBe(null);
        expect(deleteStub.calledOnce).toBe(true);
        done();
      });
    });

    test('should call the DocumentClient.delete method with appropiate arguments', done => {
      TestModel().delete({ id }, err => {
        expect(err).toBe(null);
        expect(deleteStub.calledOnce).toBe(true);
        expect(deleteStub.args[0][0]).toEqual({
          TableName: table,
          Key: {
            id: tenant + '|' + id
          }
        });
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
        send: callback => callback(null)
      });
    });

    afterEach(() => {
      putStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel().create).toBe('function');
    });

    test('should return immediately if callback is defined', done => {
      var model = TestModel();
      model.create({ name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);

        done();
      });
    });

    test('should call the DocumentClient.put method with appropiate arguments', done => {
      TestModel().create({ id, name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(putStub.args[0][0]).toEqual({
          TableName: table,
          Item: {
            id: tenant + '|' + id,
            name
          }
        });
        done();
      });
    });

    test('should create the item with the provided data', done => {
      var model = TestModel();
      model.create({ name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(Object.keys(model.data[0]).length).toBe(2);
        expect(model.data[0].name).toEqual(name);

        done();
      });
    });

    test('should add a random hash id if it is not defined', done => {
      var model = TestModel();
      model.create({ name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(model.data[0].id).not.toBe(undefined);

        done();
      });
    });

    test('should add a createdAt and updatedAt values', done => {
      var TestModel = DynamoDBModel.create({
        documentClient: db,
        hash: 'id',
        table: 'TableTest',
        tenant: '1234',
        track: true,
        schema: {
          name: {
            type: 'string',
            required: true
          },
          age: { type: 'number' }
        }
      });
      var model = TestModel();
      model.create({ name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(model.data[0].createdAt).not.toBe(undefined);
        expect(model.data[0].updatedAt).not.toBe(undefined);

        done();
      });
    });

    test('should use the provided hash if it is defined', done => {
      var model = TestModel();
      var id = 'SomeID';
      model.create({ id, name }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(model.data[0].id).toBe(id);

        done();
      });
    });

    test('should only allow the keys configured on the `schema`', done => {
      var model = TestModel();
      var gender = 'm';
      model.create({ name, gender }, err => {
        expect(err).toBe(null);
        expect(putStub.calledOnce).toBe(true);
        expect(model.data[0].gender).toBe(undefined);

        done();
      });
    });

    test('should throw an error is one of the values does not conforms to the schema', done => {
      var model = TestModel();
      var age = '29';
      model.create({ name, age }, err => {
        expect(err).not.toBe(null);
        expect(putStub.calledOnce).toBe(false);
        expect(model.data.length).toBe(0);
        expect(err.message).toBe('The value of `age` should be a number');
        done();
      });
    });

    test('should throw an error is one of the required values is not set', done => {
      var model = TestModel();
      var age = 20;
      model.create({ age }, err => {
        expect(err).not.toBe(null);
        expect(putStub.calledOnce).toBe(false);
        expect(model.data.length).toBe(0);
        expect(err.message).toBe('The attribute `name` is required.');
        done();
      });
    });

    test('should throw an error is the range key is undefined', done => {
      var TestModel = DynamoDBModel.create({
        documentClient: db,
        hash: 'id',
        range: 'username',
        table: 'TableTest',
        tenant: '1234',
        schema: {
          name: {
            type: 'string',
            required: true
          },
          age: { type: 'number' }
        }
      });

      var model = TestModel();
      var age = 20;
      model.create({ name, age }, err => {
        expect(err).not.toBe(null);
        expect(putStub.calledOnce).toBe(false);
        expect(model.data.length).toBe(0);
        expect(err.message).toBe(
          "The range key `username` can't be undefined."
        );
        done();
      });
    });
  });

  describe('#get()', () => {
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      getStub.returns({
        send: callback => callback(null, { ...data, id: tenant + '|' + id })
      });
    });

    afterEach(() => {
      getStub.restore();
    });

    test('should call the callback if provided', done => {
      var model = TestModel();
      model.get({ id }, err => {
        expect(err).toBe(null);
        expect(getStub.calledOnce).toBe(true);
        done();
      });
    });

    test('should set the data on the model', done => {
      var model = TestModel();
      model.get({ id }, err => {
        expect(err).toBe(null);
        expect(getStub.calledOnce).toBe(true);
        expect(model.data[0]).toEqual(data);
        done();
      });
    });
  });
});
