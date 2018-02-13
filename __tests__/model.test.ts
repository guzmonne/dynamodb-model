import { Model } from '../src/model';
import { DynamoDBModel } from '../src/dynamodb_model';
import * as sinon from 'sinon';
import { DynamoDB, config } from 'aws-sdk';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

var TestModel = DynamoDBModel.create({
  documentClient: db,
  hash: 'id',
  table: 'TableTest'
});

describe('Model', () => {
  test('should be a function', () => {
    expect(typeof Model).toEqual('function');
    expect(typeof TestModel).toEqual('function');
  });

  var id = 'abcd';
  var data = { id, name: 'Test' };
  describe('#promise()', () => {
    var promiseStub: sinon.SinonStub;

    beforeEach(() => {
      promiseStub = sinon.stub(db, 'get');
      promiseStub.returns({
        promise: () => Promise.resolve({ Item: data })
      });
    });

    afterEach(() => {
      promiseStub.restore();
    });

    test('should be a function', () => {
      var model = TestModel();
      expect(typeof model.promise).toBe('function');
    });

    test('should set the `data` items on success', () => {
      var model = TestModel();
      return model
        .get({ id })
        .promise()
        .then(() => {
          expect(promiseStub.calledOnce).toBe(true);
          expect(model.data[0]).toEqual(data);
        });
    });
  });

  describe('#get()', () => {
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      getStub.returns({
        send: callback => callback(null, data)
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
        expect(model.data[0]).toEqual(data);
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
