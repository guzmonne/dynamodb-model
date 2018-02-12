import * as sinon from 'sinon';
import { DynamoDB, config } from 'aws-sdk';
import { DynamoDBModel } from '../src/index';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

describe('DynamoDB Model', () => {
  test('should be a function', () => {
    expect(typeof DynamoDBModel).toEqual('function');
  });

  describe('.config()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.config).toEqual('function');
    });

    test('should configure the static `DynamoDBModel` options', () => {
      expect(DynamoDBModel.global.table).toBe(undefined);
      expect(DynamoDBModel.global.tenant).toBe(undefined);
      expect(DynamoDBModel.global.documentClient).toBe(undefined);
      var tenant = 'SomeTenant';
      var table = 'SomeTable';
      var documentClient = DynamoDBModel.config({
        table: 'SomeTable',
        tenant: 'SomeTenant',
        documentClient: db
      });
      expect(DynamoDBModel.global.table).toBe(table);
      expect(DynamoDBModel.global.tenant).toBe(tenant);
      expect(DynamoDBModel.global.documentClient).toBe(db);
    });
  });

  var TestModel = new DynamoDBModel({
    hash: 'id',
    table: 'TestTable',
    tenant: 'test-tenant',
    documentClient: db
  });

  describe('#get()', () => {
    var id: string = 'abcd';
    var data = {id: '1', name: 'John Doe'};
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
      getStub.returns({
        send: callback => callback(null, data);
      });
    });

    afterEach(() => {
      getStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel.get).toEqual('function');
    });

    test('should return an instance of DynamoDBModel', () => {
      expect(TestModel.get({ id }) instanceof DynamoDBModel).toBe(true);
    });

    test('should call the callback immediately if provided', done => {
      TestModel.get({ id }, err => {
        if (err) console.log(err);
        expect(err).toBe(null);
        expect(getStub.calledOnce).toBe(true);
        done();
      });
    });

    test('should set the data on the model on success', done => {
      TestModel.get({ id }, err => {
        if (err) console.log(err);
        expect(err).toBe(null);
        expect(getStub.calledOnce).toBe(true);
        expect(TestModel.data).toEqual(data);
        done();
      });
    });
  });
});
