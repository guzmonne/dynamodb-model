import { DynamoDB } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IItem {
  [key: string]: any;
}

export interface IDynamoDBKey {
  [key: string]: string;
}

export interface IDynamoDBModelSchemaOptions {
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  required?: boolean;
}

export interface IDynamoDBModelSchema {
  [key: string]: IDynamoDBModelSchemaOptions;
}

export interface IDynamoDBModelConfig {
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  track?: boolean;
  tenant?: string;
  documentClient: DocumentClient;
}

export interface IDynamoDBModel {
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  track: boolean;
  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  promise(): Promise<void>;
}

export interface ICallResult {
  items: IItem[];
  count: number;
  lastEvaluatedKey?: IDynamoDBKey;
}

export interface IDynamoDBModelTrack {
  updatedAt?: string;
  createdAt?: string;
}
