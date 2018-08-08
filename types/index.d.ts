import { DynamoDB } from 'aws-sdk';
import { IDefaultModel } from './default_model';
import { IDynamoDBModelConfig } from './model';
export * from './default_model';
export interface IDynamoDBModelGlobalConfig {
    tenant?: string;
    table?: string;
    documentClient?: DynamoDB.DocumentClient;
}
export declare namespace DynamoDBModel {
    function getConfig(): IDynamoDBModelGlobalConfig;
    function config(options: IDynamoDBModelGlobalConfig): void;
    function create(config: IDynamoDBModelConfig): () => IDefaultModel;
    function createModel(config: IDynamoDBModelConfig): any;
    function extend(config: IDynamoDBModelConfig, extendFn: (model: any) => {
        new (): IDefaultModel;
    }): () => any;
}
