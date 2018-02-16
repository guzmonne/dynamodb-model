import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { SimpleModel } from './simple_model';
import { IDynamoDBModelConfig } from './model';

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

  export function create(config: IDynamoDBModelConfig): () => SimpleModel {
    config = { ...global, ...config };

    class DynamoDBComplexModel extends SimpleModel {
      constructor() {
        super(config);
      }
    }

    return function(): SimpleModel {
      return new DynamoDBComplexModel();
    };
  }
}
