import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
export interface IItem {
    [key: string]: any;
}
export interface IDynamoDBKey {
    [key: string]: string;
}
export interface IDynamoDBModelTrack {
    updatedAt?: string;
    createdAt?: string;
}
export interface IDynamoDBModelConfig {
    documentClient: DocumentClient;
    hash: string;
    hashType?: 'string' | 'number';
    indexName?: string;
    maxGSIK?: number;
    range?: string;
    rangeType?: 'string' | 'number';
    struct: IDynamoDBModelStruct;
    table: string;
    tenant?: string;
    track?: boolean;
}
export interface IDynamoDBModelStruct {
    [key: string]: string;
}
export interface IModel {
    data: IItem[];
    documentClient: DocumentClient;
    hash: string;
    hashType: string;
    hasTenantRegExp?: RegExp;
    indexName: string;
    maxGSIK: number;
    range?: string;
    rangeType: string;
    table: string;
    tenant?: string;
    track: boolean;
    struct: any;
}
export declare abstract class Model implements IModel {
    data: IItem[];
    documentClient: DocumentClient;
    hash: string;
    hashType: string;
    hasTenantRegExp?: RegExp;
    indexName: string;
    maxGSIK: number;
    range?: string;
    rangeType: string;
    table: string;
    tenant?: string;
    track: boolean;
    struct: any;
    constructor(config: IDynamoDBModelConfig);
    trackChanges(body: IItem): IDynamoDBModelTrack;
    getKey(key: IDynamoDBKey): IDynamoDBKey;
    substringBy(length: number, predicate: (value: string) => boolean): (value: string) => string;
    addTenant(): IItem;
    private removeTenantFromItem(item, substring);
    removeTenant(items: IItem): IItem;
    removeTenant(items: IItem[]): IItem[];
    validate(body: IItem): boolean;
}
