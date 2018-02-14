import { ComplexModel } from './complex_model';
import { SimpleModel } from './simple_model';
import { IDynamoDBModelGlobalConfig, IDynamoDBModelConfig } from './index.d';

var global: IDynamoDBModelGlobalConfig = {};

export namespace DynamoDBModel {
  export function getConfig() {
    return Object.assign({}, global);
  }

  export function config(options: IDynamoDBModelGlobalConfig): void {
    global = Object.assign({}, global, options);
  }

  export function createSimpleModel(
    config: IDynamoDBModelConfig
  ): () => SimpleModel {
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
