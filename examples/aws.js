var AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

exports.DynamoDB = new AWS.DynamoDB({
  endpoint: 'http://localhost:8989'
});

exports.documentClient = new AWS.DynamoDB.DocumentClient({
  service: exports.DynamoDB
});
