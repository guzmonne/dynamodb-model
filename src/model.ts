export interface IDynamoDBModel {
  get(): void;
}

export class Model implements IDynamoDBModel {
  get() {}
}
