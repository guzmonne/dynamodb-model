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
  static global: IDynamoDBModelConfig = {
    table: '',
    tenant: '',
    documentClient: new DynamoDB.DocumentClient()
  };
  private table: string;
  private tenant: string;
  private documentClient: ICustomDocumentClient;

  constructor(config?: IDynamoDBModelConfig) {
    config = Object.assign({}, DynamoDBModel.global, config);
    this.documentClient = new DynamoDB.DocumentClient();
    this.tenant = config.tenant || '';
    this.table = config.table || '';
  }

  static config(config: IDynamoDBModelConfig): void {
    this.global = Object.assign({}, this.global, config);
  }

  get(id?: string) {
    console.log(id);
    return this;
  }
}
