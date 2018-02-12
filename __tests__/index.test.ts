import * as sinon from 'sinon';
import { DynamoDB } from 'aws-sdk';
import { DynamoDBModel } from '../src/index';

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
    hash: 'id'
  });

  describe('#get()', () => {
    var getStub: sinon.SinonStub;

    beforeEach(() => {
      getStub = sinon.stub(db, 'get');
    });

    afterEach(() => {
      getStub.restore();
    });

    test('should be a function', () => {
      expect(typeof TestModel.get).toEqual('function');
    });

    test('should return an instance of DynamoDBModel', () => {
      expect(TestModel.get({ id: '1' }) instanceof DynamoDBModel).toBe(true);
    });
  });
});
