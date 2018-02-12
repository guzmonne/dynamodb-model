import { ICustomDocumentClient, IDynamoDBGetParams } from '../../src/';

function promiseObject(value?: any): { promise: () => Promise<any> } {
  return {
    promise: () => Promise.resolve(value)
  };
}

export var customDocumentClient: ICustomDocumentClient = {
  get(params) {
    return promiseObject();
  }
};
