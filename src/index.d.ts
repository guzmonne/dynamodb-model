import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

export interface IDynamoDBModelGlobalConfig {
  tenant?: string;
  table?: string;
  documentClient?: DocumentClient;
}
