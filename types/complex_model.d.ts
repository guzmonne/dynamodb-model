import { Model } from './model';
import { IDynamoDBModel, IItem, IDynamoDBModelConfig, IDynamoDBKey } from './index.d';
import { IComplexModel } from './complex_model.d';
export declare class ComplexModel extends Model implements IComplexModel {
    private calls;
    constructor(config: IDynamoDBModelConfig);
    private handleValidationError(err, callback?);
    delete(key: IDynamoDBKey): IDynamoDBModel;
    delete(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    get(key: IDynamoDBKey): IDynamoDBModel;
    get(key: IDynamoDBKey, callback: (error: Error | null) => void): void;
    create(body: IItem): IDynamoDBModel;
    create(body: IItem, callback: (error: Error | null) => void): void;
    promise(): Promise<void>;
}
