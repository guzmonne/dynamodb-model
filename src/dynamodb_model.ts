import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { Model, IDynamoDBModelConfig } from './model';

export interface IDynamoDBModelGlobalConfig {
  tenant?: string;
  table?: string;
  documentClient?: DocumentClient;
}

var global: IDynamoDBModelGlobalConfig = {};

export namespace DynamoDBModel {
  export function getConfig() {
    return Object.assign({}, global);
  }

  export function config(options: IDynamoDBModelGlobalConfig): void {
    global = Object.assign({}, global, options);
  }

  export function create(config: IDynamoDBModelConfig): () => Model {
    config = { ...global, ...config };

    class NewModel extends Model {
      constructor() {
        super(config);
      }
    }

    return function(): Model {
      return new NewModel();
    };
  }
}