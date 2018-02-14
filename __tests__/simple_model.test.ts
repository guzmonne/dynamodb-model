import { SimpleModel } from '../src/simple_model';
import { DynamoDBModel } from '../src/';
import * as sinon from 'sinon';
import { DynamoDB, config } from 'aws-sdk';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

describe('SimpleModel', () => {
  test('should be a function', () => {
    expect(typeof SimpleModel).toBe('function');
  });
});
