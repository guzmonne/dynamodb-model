/**
 * DynamoDB Model
 */
import { DynamoDB } from 'aws-sdk';
export interface IDynamoDBGetParams {
    TableName: string;
    Key: {
        [key: string]: string;
    };
}
export interface ICustomDocumentClient {
    get: (params: IDynamoDBGetParams) => {
        promise: () => Promise<any>;
    };
}
export interface IDynamoDBModelConfig {
    documentClient: DynamoDB.DocumentClient | ICustomDocumentClient;
    table?: string;
    tenant?: string;
}
export interface IDynamoDBModel {
    get: (id?: string) => IDynamoDBModel;
}
export declare class DynamoDBModel implements IDynamoDBModel {
    static table: string;
    static tenant: string;
    static documentClient: ICustomDocumentClient;
    constructor(config: IDynamoDBModelConfig);
    static config(config: IDynamoDBModelConfig): void;
    get(id?: string): this;
}
