import { DynamoDB } from 'aws-sdk';
import { IDefaultModel, DefaultModel } from './default_model';
import { IDynamoDBModelConfig } from './model';

export * from './default_model';

export interface IDynamoDBModelGlobalConfig {
  tenant?: string;
  table?: string;
  documentClient?: DynamoDB.DocumentClient;
}

var global: IDynamoDBModelGlobalConfig = {};

export namespace DynamoDBModel {
  export function getConfig() {
    return Object.assign({}, global);
  }

  export function config(options: IDynamoDBModelGlobalConfig): void {
    global = Object.assign({}, global, options);
  }

  export function create(config: IDynamoDBModelConfig): () => IDefaultModel {
    var Model = createModel(config);

    return function(): IDefaultModel {
      return new Model();
    };
  }

  export function createModel(config: IDynamoDBModelConfig): any {
    class Model extends DefaultModel {
      constructor() {
        super({ ...global, ...config });
      }
    }

    return Model;
  }

  export function extend(
    config: IDynamoDBModelConfig,
    extendFn: (model: any) => { new (): IDefaultModel }
  ): () => any {
    var Model = createModel(config);

    var ExtendedModel: any = extendFn(Model) as { new (): any };

    return function() {
      return new ExtendedModel();
    };
  }
}
