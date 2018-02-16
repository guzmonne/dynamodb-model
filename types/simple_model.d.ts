import { Model, IModel, IItem, IDynamoDBKey, IDynamoDBModelConfig } from './model';
export interface ISimpleModel extends IModel {
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    promise(): Promise<IItem | void>;
    get(key: IDynamoDBKey): ISimpleModel;
}
export declare class SimpleModel extends Model implements ISimpleModel {
    private call;
    constructor(config: IDynamoDBModelConfig);
    private handleError(error);
    private createUpdateExpression(body);
    promise(): Promise<IItem | void>;
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    create(body: IItem): ISimpleModel;
    update(body: IItem): ISimpleModel;
    get(key: IDynamoDBKey): ISimpleModel;
}
