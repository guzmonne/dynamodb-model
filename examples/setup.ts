import * as AWS from 'aws-sdk';
import { DynamoDBModel } from '../dist/';

AWS.config.update({ region: 'us-east-1' });
var DynamoDB = new AWS.DynamoDB({
  endpoint: 'http://localhost:8989'
});

DynamoDB.createTable({
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'gsik',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  TableName: 'DynamoDBUserModel',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'byGSIK',
      KeySchema: [
        {
          AttributeName: 'gsik',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ]
})
  .promise()
  .then(data => {
    console.log(data);
    console.log('All Done!!!');
  })
  .catch(error => {
    console.log(error);
  });

export var documentClient = new AWS.DynamoDB.DocumentClient({
  service: DynamoDB
});
