import { DynamoDB } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IItem {
  [key: string]: any;
}

export interface IDynamoDBKey {
  [key: string]: string;
}

export interface IDynamoDBModelGlobalConfig {
  documentClient?: DynamoDB.DocumentClient;
  table?: string;
  tenant?: string;
}

export interface IDynamoDBModelConfig extends IDynamoDBModelGlobalConfig {
  hash: string;
  range?: string;
}

export interface IDynamoDBModel {
  get: (key: IDynamoDBKey) => IDynamoDBModel | void;
}
