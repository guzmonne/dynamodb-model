import { IItem, IDynamoDBKey, IDynamoDBModelConfig } from './index.d';
import { Model } from './model';
import { ISimpleModel } from './simple_model.d';
export declare class SimpleModel extends Model implements ISimpleModel {
    private call;
    constructor(config: IDynamoDBModelConfig);
    private handleError(error);
    promise(): Promise<IItem | void>;
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    create(body: IItem): ISimpleModel;
    get(key: IDynamoDBKey): ISimpleModel;
}
