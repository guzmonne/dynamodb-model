import { Model } from './model';
import { IDynamoDBModelGlobalConfig } from './index.d';
import { IDynamoDBModelConfig } from './model.d';

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

    class DynamoDBModel extends Model {
      constructor() {
        super(config);
      }
    }

    return function(): Model {
      return new DynamoDBModel();
    };
  }
}
