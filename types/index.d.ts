import { ComplexModel } from './complex_model';
import { SimpleModel } from './simple_model';
import { IDynamoDBModelGlobalConfig, IDynamoDBModelConfig } from './index.d';
export declare namespace DynamoDBModel {
    function getConfig(): IDynamoDBModelGlobalConfig;
    function config(options: IDynamoDBModelGlobalConfig): void;
    function createSimpleModel(config: IDynamoDBModelConfig): () => SimpleModel;
    function createComplexModel(config: IDynamoDBModelConfig): () => ComplexModel;
}
