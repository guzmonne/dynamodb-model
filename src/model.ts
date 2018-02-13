import { pick } from 'lodash';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';

export interface IItem {
  [key: string]: any;
}

export interface IDynamoDBKey {
  [key: string]: string;
}

export interface IDynamoDBModelSchema {
  [key: string]: {
    type: string;
  };
}

export interface IDynamoDBModelConfig {
  hash: string;
  range?: string;
  // schema: IDynamoDBModelSchema;
  table: string;
  track?: boolean;
  tenant?: string;
  documentClient: DocumentClient;
}

export interface IDynamoDBModel {
  hash: string;
  range?: string;
  //schema: IDynamoDBModelSchema;
  table: string;
  //track?: boolean;
  get(key: IDynamoDBKey, callback?: (error: Error | null) => void): void;
}

export class Model implements IDynamoDBModel {
  data: IItem | IItem[] | undefined;
  documentClient: DocumentClient;
  hash: string;
  range?: string;
  table: string;
  tenant?: string;

  private calls: (() => Promise<
    PromiseResult<DocumentClient.GetItemOutput, AWSError>
  >)[] = [];

  constructor(config: IDynamoDBModelConfig) {
    this.hash = config.hash;
    this.table = config.table;
    this.documentClient = config.documentClient;
    if (config.range !== undefined) this.range = config.range;
    if (config.tenant !== undefined) this.tenant = config.tenant;
  }

  private getKey(key: IDynamoDBKey) {
    key = pick(key, this.hash, this.range || '');
    key[this.hash] = [this.tenant, key[this.hash]]
      .filter(x => x !== undefined)
      .join('|');
    return key;
  }

  get(key: IDynamoDBKey, callback?: (error: Error | null) => void) {
    var call = this.documentClient.get({
      TableName: this.table,
      Key: this.getKey(key)
    });

    if (typeof callback === 'function')
      return call.send((err, data) => {
        if (err !== null) return callback(err);
        this.data = data;
        callback(null);
      });

    this.calls.push(() => call.promise());

    return this;
  }
}
