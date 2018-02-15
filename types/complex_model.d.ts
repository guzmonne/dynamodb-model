import { IModel, Model, IItem, IDynamoDBKey, IDynamoDBModelConfig } from './model';
export interface ICallResult {
    items: IItem[];
    lastEvaluatedKey?: IDynamoDBKey;
}
export interface IComplexModel extends IModel {
    create(body: IItem): IComplexModel;
    create(body: IItem, callback: (error: Error | null) => void): void;
    delete(key: IDynamoDBKey): IComplexModel;
    delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    get(key: IDynamoDBKey): IComplexModel;
    get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    promise(): Promise<void>;
}
export declare class ComplexModel extends Model implements IComplexModel {
    private calls;
    constructor(config: IDynamoDBModelConfig);
    private handleValidationError(err, callback?);
    delete(key: IDynamoDBKey): IComplexModel;
    delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    get(key: IDynamoDBKey): IComplexModel;
    get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    create(body: IItem): IComplexModel;
    create(body: IItem, callback: (error: Error | null) => void): void;
    promise(): Promise<void>;
}
