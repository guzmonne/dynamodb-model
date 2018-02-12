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
      expect(DynamoDBModel.table).toBe(undefined);
      expect(DynamoDBModel.tenant).toBe('');
      expect(
        DynamoDBModel.documentClient instanceof DynamoDB.DocumentClient === true
      ).toBe(true);
      var tenant = 'SomeTenant';
      var table = 'SomeTable';
      var documentClient = DynamoDBModel.config({
        table: 'SomeTable',
        tenant: 'SomeTenant',
        documentClient: customDocumentClient
      });
      expect(DynamoDBModel.table).toBe(table);
      expect(DynamoDBModel.tenant).toBe(tenant);
      expect(DynamoDBModel.documentClient).toBe(customDocumentClient);
    });
  });

  //var TestModel = new DynamoDBModel();

  //describe('#get()', () => {});
});
