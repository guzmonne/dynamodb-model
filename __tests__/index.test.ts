import { DynamoDB } from 'aws-sdk';
import { DynamoDBModel } from '../src/index';
import { customDocumentClient } from './utils/custom-document-client';

describe('DynamoDB Model', () => {
  test('should be a function', () => {
    expect(typeof DynamoDBModel).toEqual('function');
  });

  describe('.config()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.config).toEqual('function');
    });

    test('should configure the static `DynamoDBModel` options', () => {
      expect(DynamoDBModel.global.table).toBe('');
      expect(DynamoDBModel.global.tenant).toBe('');
      expect(
        DynamoDBModel.global.documentClient instanceof
          DynamoDB.DocumentClient ===
          true
      ).toBe(true);
      var tenant = 'SomeTenant';
      var table = 'SomeTable';
      var documentClient = DynamoDBModel.config({
        table: 'SomeTable',
        tenant: 'SomeTenant',
        documentClient: customDocumentClient
      });
      expect(DynamoDBModel.global.table).toBe(table);
      expect(DynamoDBModel.global.tenant).toBe(tenant);
      expect(DynamoDBModel.global.documentClient).toBe(customDocumentClient);
    });
  });

  var TestModel = new DynamoDBModel();

  describe('#get()', () => {});
});
