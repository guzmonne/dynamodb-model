import { Model, IModel, IItem, IDynamoDBKey, IDynamoDBModelConfig } from './model';
export interface IDynamoDBModelScanOptions {
    limit?: number;
    offset?: string;
    filter?: string;
    attributes?: string;
}
export interface IDefaultModel extends IModel {
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    promise(): Promise<IItem | void>;
    get(key: IDynamoDBKey): IDefaultModel;
    delete(key: IDynamoDBKey): IDefaultModel;
    create(body: IItem): IDefaultModel;
    update(body: IItem): IDefaultModel;
    index(options?: IDynamoDBModelScanOptions): IDefaultModel;
}
export declare class DefaultModel extends Model implements IDefaultModel {
    private call;
    constructor(config: IDynamoDBModelConfig);
    private handleError(error);
    private createUpdateExpressionParams(body);
    promise(): Promise<IItem | void>;
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    create(body: IItem): IDefaultModel;
    update(body: IItem): IDefaultModel;
    get(key: IDynamoDBKey): IDefaultModel;
    delete(key: IDynamoDBKey): IDefaultModel;
    private scan(options);
    private query(options);
    index(options?: IDynamoDBModelScanOptions): IDefaultModel;
}
