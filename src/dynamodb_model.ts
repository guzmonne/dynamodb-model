import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { Model } from './model';

interface IDynamoDBModelSchema {
  [key: string]: {
    type: string;
  };
}

export interface IDynamoDBModelGlobalConfig {
  tenant?: string;
  table?: string;
  documentClient?: DocumentClient;
}

interface IDynamoDBModelConfig {
  hash: string;
  range?: string;
  schema: IDynamoDBModelSchema;
  table?: string;
  track?: boolean;
}

interface IDynamoDBModelFactory {
  config(options: IDynamoDBModelGlobalConfig): void;
}

var global: IDynamoDBModelGlobalConfig = {};

export namespace DynamoDBModel {
  export function getConfig() {
    return Object.assign({}, global);
  }

  export function config(options: IDynamoDBModelGlobalConfig): void {
    global = Object.assign({}, global, options);
  }

  export function create() {
    class NewModel extends Model {
      constructor() {
        super();
      }
    }

    return function(): Model {
      return new NewModel();
    };
  }
}
