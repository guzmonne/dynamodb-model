import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { IComplexModel } from './complex_model';
import { SimpleModel } from './simple_model';
import { IDynamoDBModelConfig } from './model';
export interface IDynamoDBModelGlobalConfig {
    tenant?: string;
    table?: string;
    documentClient?: DocumentClient;
}
export declare namespace DynamoDBModel {
    function getConfig(): IDynamoDBModelGlobalConfig;
    function config(options: IDynamoDBModelGlobalConfig): void;
    function createSimpleModel(config: IDynamoDBModelConfig): () => SimpleModel;
    function createComplexModel(config: IDynamoDBModelConfig): () => IComplexModel;
}
