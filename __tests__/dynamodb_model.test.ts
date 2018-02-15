import { DynamoDBModel } from '../src/';
import { ComplexModel } from '../src/complex_model';
import { IDynamoDBModelConfig } from '../src/index.d';
import { DynamoDB, config } from 'aws-sdk';
import { SimpleModel } from '../src/simple_model';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

describe('DynamoDBModel', () => {
  test('should be an object', () => {
    expect(typeof DynamoDBModel).toEqual('object');
  });

  describe('.config()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.config).toEqual('function');
    });

    test('should configure the static `DynamoDBModel` options', () => {
      expect(DynamoDBModel.getConfig().table).toBe(undefined);
      expect(DynamoDBModel.getConfig().tenant).toBe(undefined);
      expect(DynamoDBModel.getConfig().documentClient).toBe(undefined);
      var tenant = 'SomeTenant';
      var table = 'SomeTable';
      var documentClient = DynamoDBModel.config({
        table: 'SomeTable',
        tenant: 'SomeTenant',
        documentClient: db
      });
      expect(DynamoDBModel.getConfig().table).toBe(table);
      expect(DynamoDBModel.getConfig().tenant).toBe(tenant);
      expect(DynamoDBModel.getConfig().documentClient).toBe(db);
    });
  });

  describe('.createSimpleModel()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.createSimpleModel).toEqual('function');
    });

    var params: IDynamoDBModelConfig = {
      documentClient: db,
      hash: 'id',
      struct: {
        name: 'string'
      },
      schema: {
        name: { type: 'string' }
      },
      table: 'TableTest'
    };

    test('should return a function', () => {
      expect(typeof DynamoDBModel.createSimpleModel(params)).toEqual(
        'function'
      );
    });

    test('should return an instance of `SimpleModel`', () => {
      expect(
        DynamoDBModel.createSimpleModel(params)() instanceof SimpleModel
      ).toBe(true);
    });
  });

  describe('.createComplexModel()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.createComplexModel).toEqual('function');
    });

    var params: IDynamoDBModelConfig = {
      documentClient: db,
      hash: 'id',
      struct: {
        name: 'string'
      },
      schema: {
        name: { type: 'string' }
      },
      table: 'TableTest'
    };

    test('should return a function', () => {
      expect(typeof DynamoDBModel.createComplexModel(params)).toEqual(
        'function'
      );
    });

    test('should return an instance of `ComplexModel`', () => {
      expect(
        DynamoDBModel.createComplexModel(params)() instanceof ComplexModel
      ).toBe(true);
    });
  });
});
