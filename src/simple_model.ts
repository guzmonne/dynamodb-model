import { IItem, IDynamoDBKey, IDynamoDBModelConfig } from './index.d';
import { IModel, Model } from './model';

interface ISimpleModel extends IModel {
  get(key: IDynamoDBKey): ISimpleModel;
}

export class SimpleModel extends Model implements ISimpleModel {
  private call: () => Promise<IItem | void> = () => Promise.resolve();

  constructor(config: IDynamoDBModelConfig) {
    super(config);
  }

  get(key: IDynamoDBKey): ISimpleModel {
    this.documentClient.get({
      TableName: this.table,
      Key: key
    });

    return this;
  }
}
