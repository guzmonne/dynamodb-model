import { DynamoDB } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { IDynamoDBModelStruct } from './model.d';

export interface IDynamoDBModelGlobalConfig {
  tenant?: string;
  table?: string;
  documentClient?: DocumentClient;
}

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
  hashType?: 'string' | 'number';
  range?: string;
  rangeType?: 'string' | 'number';
  struct: IDynamoDBModelStruct;
  table: string;
  track?: boolean;
  tenant?: string;
  documentClient: DocumentClient;
}

export interface IDynamoDBModel {
  create(body: IItem): IDynamoDBModel;
  create(body: IItem, callback: (error: Error | null) => void): void;
  delete(key: IDynamoDBKey): IDynamoDBModel;
  delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  get(key: IDynamoDBKey): IDynamoDBModel;
  get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
  promise(): Promise<void>;
  hash: string;
  range?: string;
  struct: IDynamoDBModelStruct;
  //  set(body: IItem): IDynamoDBModel;
  //  set(body: IItem, callback: (error: Error | null) => void): void;
  table: string;
  track: boolean;
}

export interface ICallResult {
  items: IItem[];
  lastEvaluatedKey?: IDynamoDBKey;
}

export interface IDynamoDBModelTrack {
  updatedAt?: string;
  createdAt?: string;
}
