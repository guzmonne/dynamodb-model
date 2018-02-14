import { SimpleModel } from '../src/simple_model';
import { DynamoDBModel } from '../src/';
import * as sinon from 'sinon';
import { DynamoDB, config } from 'aws-sdk';

config.update({
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

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

describe('SimpleModel', () => {
  test('should be a function', () => {
    expect(typeof SimpleModel).toBe('function');
  });

  test('should be an instance of SimpleModel', () => {
    expect(TestModel() instanceof SimpleModel).toBe(true);
  });

  describe('#get()', () => {
    test('should be a function', () => {
      expect(typeof TestModel().get).toBe('function');
    });
  });
});
