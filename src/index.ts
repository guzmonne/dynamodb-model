/**
 * DynamoDB Model
 */
import { DynamoDB } from 'aws-sdk';

export interface IDynamoDBGetParams {
  TableName: string;
  Key: {
    [key: string]: string;
  };
}

export interface ICustomDocumentClient {
  get: (params: IDynamoDBGetParams) => { promise: () => Promise<any> };
}

export interface IDynamoDBModelConfig {
  documentClient: DynamoDB.DocumentClient | ICustomDocumentClient;
  table?: string;
  tenant?: string;
}

export interface IDynamoDBModel {
  get: (id?: string) => IDynamoDBModel;
}

export class DynamoDBModel implements IDynamoDBModel {
  static table: string;
  static tenant: string = '';
  static documentClient: ICustomDocumentClient = new DynamoDB.DocumentClient();

  constructor(config: IDynamoDBModelConfig) {
    if (config.documentClient !== undefined)
      DynamoDBModel.documentClient = new DynamoDB.DocumentClient();
    if (config.tenant !== undefined) DynamoDBModel.tenant = config.tenant;
    if (config.table !== undefined) DynamoDBModel.table = config.table;
  }

  static config(config: IDynamoDBModelConfig): void {
    if (config.documentClient !== undefined)
      this.documentClient = config.documentClient;
    if (config.tenant !== undefined) this.tenant = config.tenant;
    if (config.table !== undefined) this.table = config.table;
  }

  get(id?: string) {
    console.log(id);
    return this;
  }
}
