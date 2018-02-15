import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { IItem, IDynamoDBModelConfig, IDynamoDBModelTrack, IDynamoDBKey } from './index.d';
import { IModel } from './model.d';
export declare abstract class Model implements IModel {
    data: IItem[];
    documentClient: DocumentClient;
    hash: string;
    hashType: string;
    hasTenantRegExp?: RegExp;
    range?: string;
    rangeType: string;
    table: string;
    tenant?: string;
    track: boolean;
    struct: any;
    constructor(config: IDynamoDBModelConfig);
    trackChanges(body: IItem): IDynamoDBModelTrack;
    addTenant(key: IDynamoDBKey): IDynamoDBKey;
    substringBy(length: number, predicate: (value: string) => boolean): (value: string) => string;
    removeTenant(items: IItem): IItem;
    removeTenant(items: IItem[]): IItem[];
    validate(body: IItem): boolean;
}
