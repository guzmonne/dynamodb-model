import * as sinon from 'sinon';
import * as cuid from 'cuid';
import { DynamoDB, config } from 'aws-sdk';
import { SimpleModel } from '../src/simple_model';
import { DynamoDBModel } from '../src/';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

var tenant = '1234';
var table = 'TableTest';
var TestModel = DynamoDBModel.createSimpleModel({
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

  describe('#get()', () => {
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      getStub.returns({
        promise: () => Promise.resolve({ id, name })
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
  });
});
