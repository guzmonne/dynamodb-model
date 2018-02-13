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

  describe('#get()', () => {
    var getStub: sinon.SinonStub;
    var id = 'abcd';
    var data = { id, name: 'Test' };

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
        expect(model.data).toEqual(data);
        done();
      });
    });
  });
});
