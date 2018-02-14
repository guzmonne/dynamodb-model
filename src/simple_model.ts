import { IItem, IDynamoDBKey, IDynamoDBModelConfig } from './index.d';
import { IModel, Model } from './model';

interface ISimpleModel extends IModel {
  callback(callback: (error: Error | null, data?: IItem | void) => void): void;
  promise(): Promise<IItem | void>;
  get(key: IDynamoDBKey): ISimpleModel;
}

export class SimpleModel extends Model implements ISimpleModel {
  private call: () => Promise<IItem | void> = () => Promise.resolve();

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }

  promise(): Promise<IItem | void> {
    return this.call();
  }

  callback(callback: (error: Error | null, data?: IItem | void) => void): void {
    this.call()
      .then(data => callback(null, data))
      .catch(err => callback(err));
  }

  get(key: IDynamoDBKey): ISimpleModel {
    var call = this.documentClient.get({
      TableName: this.table,
      Key: this.addTenant(key)
    });

    this.call = () => call.promise().then(data => data.Item);

    return this;
  }
}
