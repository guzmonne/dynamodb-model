/**
 * DynamoDB Model
 */
import { DynamoDB } from 'aws-sdk';
export interface IItem {
    [key: string]: any;
}
export interface IDynamoDBResponse {
    Items?: IItem[];
    Item?: IItem;
    Count: number;
    LastEvaluatedKey?: {
        [key: string]: any;
    };
}
export interface IDynamoDBKey {
    [key: string]: string;
}
export interface IDynamoDBGetParams {
    TableName: string;
    Key: IDynamoDBKey;
}
export interface ICustomDocumentClient {
    get(params: IDynamoDBGetParams): {
        promise: () => Promise<any>;
        send: () => (error: Error, data: IDynamoDBResponse) => void;
    };
    get(params: IDynamoDBGetParams, callback?: (error: Error) => void): void;
}
export interface IDynamoDBModelConfig {
    documentClient: DynamoDB.DocumentClient | ICustomDocumentClient;
    table?: string;
    tenant?: string;
}
export interface IDynamoDBModel {
    get: (key: IDynamoDBKey) => IDynamoDBModel;
}
export declare class DynamoDBModel implements IDynamoDBModel {
    static global: IDynamoDBModelConfig;
    private table;
    private tenant;
    private documentClient;
    private calls;
    data: IItem | IItem[] | undefined;
    constructor(config?: IDynamoDBModelConfig);
    static config(config: IDynamoDBModelConfig): void;
    get(key: IDynamoDBKey, callback?: (error: Error) => void): this;
}
