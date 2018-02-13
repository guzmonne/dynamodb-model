/**
 * DynamoDB Model
 */
import { pick } from 'lodash';
import { DynamoDB } from 'aws-sdk';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  IItem,
  IDynamoDBModel,
  IDynamoDBModelConfig,
  IDynamoDBKey
} from './index.d';
import { DynamoDBModel } from './index';

export class Model implements IDynamoDBModel {
  private table: string;
  private tenant: string;
  private documentClient: DynamoDB.DocumentClient;
  private calls: (() => Promise<
    PromiseResult<DocumentClient.GetItemOutput, AWSError>
  >)[] = [];

  public data: IItem | IItem[] | undefined;
  private hash: string;
  private range?: string;

  constructor(config: IDynamoDBModelConfig) {
    config = Object.assign({}, DynamoDBModel.global, config);
    this.documentClient =
      config.documentClient || new DynamoDB.DocumentClient();
    this.tenant = config.tenant || '';
    this.table = config.table || '';
    this.hash = config.hash;
    if (config.range !== undefined) this.range = config.range;
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
