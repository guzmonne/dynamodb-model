import { Model, IModel, IItem, IDynamoDBKey, IDynamoDBModelConfig } from './model';
export interface IDynamoDBModelIndexOptions {
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
    index(options?: IDynamoDBModelIndexOptions): IDefaultModel;
}
/**
 * Default Model
 * ===
 *
 * This basic model has some basic methods to interact with DynamoDB. It has
 * implemented all the typical `CRUD` operations, and translates them into
 * DynamoDB DocumentClient calls. By using a model, you can avoid having to
 * learn how to work with DynamoDB.
 *
 * If you want to add more methods to your model, you can create your own class
 * extended from this one.
 */
export declare class DefaultModel extends Model implements IDefaultModel {
    /**
     * DynamoDB Document Client call. You can call it by using the `callback` or
     * `promise` method.
     */
    private call;
    constructor(config: IDynamoDBModelConfig);
    /**
     * Helper function to handle errors lazily. This way the user can handle
     * them through the `callback` or `promise` api.
     * @param error Error thrown during a method call.
     */
    private handleError(error);
    /**
     * Creates the `UpdateExpression`, `ExpressionAttributeNames` and
     * `ExpressionAttributeValues` for the `documentClient.update` method params.
     * @param body Body if the item to be stored.
     */
    private createUpdateExpressionParams(body);
    /**
     * Does the stored DynamoDB DocumentClient call and wraps the result in
     * promise. It handles error produced on the call.
     */
    promise(): Promise<IItem | void>;
    /**
     * Does the stored DynamoDB DocumentClient call and wraps the result in a
     * callback. It handles error produced on the call, and passes the onto the
     * callback on the `err` argument.
     * @param callback Callback function to invoke with the data or the error
     * generated on the DynamoDB DocumentClient call.
     */
    callback(callback: (error: Error | null, data?: IItem | void) => void): void;
    /**
     * Sets up a call to DynamoDB to create a new item.
     * @param body Body of the item to be created.
     */
    create(body: IItem): IDefaultModel;
    /**
     * Sets a call to DynamoDB to update an item.
     * @param body Body of the item to be updated.
     */
    update(body: IItem): IDefaultModel;
    /**
     * Sets a call to get an item from DynamoDB.
     * @param key Item key.
     */
    get(key: IDynamoDBKey): IDefaultModel;
    /**
     * Sets a call to DynamoDB to delete an item.
     * @param key Item key.
     */
    delete(key: IDynamoDBKey): IDefaultModel;
    /**
     * Sets a call to scan the DynamoDB table according to the provided options.
     * @param options Index options used to define what items to return.
     */
    private scan(options);
    /**
     * Sets a call to query the DynamoDB table according to the provided options.
     * @param options Index options used to define what items to return.
     */
    private query(options);
    /**
     * Sets a call to DynamoDB to get a list of items.
     * @param options Index options used to set what items to return.
     */
    index(options?: IDynamoDBModelIndexOptions): IDefaultModel;
}
