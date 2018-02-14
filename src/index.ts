import { ComplexModel } from './complex_model';
import { IDynamoDBModelGlobalConfig } from './index.d';
import { IDynamoDBModelConfig } from './complex_model.d';

var global: IDynamoDBModelGlobalConfig = {};

export namespace DynamoDBModel {
  export function getConfig() {
    return Object.assign({}, global);
  }

  export function config(options: IDynamoDBModelGlobalConfig): void {
    global = Object.assign({}, global, options);
  }

  export function createComplexModel(
    config: IDynamoDBModelConfig
  ): () => ComplexModel {
    config = { ...global, ...config };

    class DynamoDBComplexModel extends ComplexModel {
      constructor() {
        super(config);
      }
    }

    return function(): ComplexModel {
      return new DynamoDBComplexModel();
    };
  }
}
