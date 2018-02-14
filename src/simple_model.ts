import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  IItem,
  IDynamoDBModelSchema,
  ICallResult,
  IDynamoDBModelConfig
} from './index.d';

interface IDynamoDBSimpleModel {}

export class SimpleModel implements IDynamoDBSimpleModel {
  data: IItem[] = [];
  documentClient: DocumentClient;
  hash: string;
  hasTenantRegExp?: RegExp;
  range?: string;
  schema: IDynamoDBModelSchema;
  table: string;
  tenant?: string;
  track: boolean = false;

  private calls: (() => Promise<ICallResult>)[] = [];

  constructor(config: IDynamoDBModelConfig) {
    this.hash = config.hash;
    this.table = config.table;
    this.documentClient = config.documentClient;
    this.schema = config.schema;
    if (config.track !== undefined) this.track = config.track;
    if (config.range !== undefined) this.range = config.range;
    if (config.tenant !== undefined) {
      this.tenant = config.tenant;
      this.hasTenantRegExp = new RegExp(`^${this.tenant}|`);
    }
  }
}
