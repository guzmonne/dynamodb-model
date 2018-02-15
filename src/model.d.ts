import { IItem } from './index.d';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IDynamoDBModelStruct {
  [key: string]: string;
}

export interface IModel {
  data: IItem[];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  struct: IDynamoDBModelStruct;
  table: string;
  tenant?: string;
  track: boolean;
}
