import * as cuid from 'cuid';
import { DynamoDBModel, DefaultModel, IDefaultModel } from '../src/';
import { DynamoDB, config } from 'aws-sdk';
import { IDynamoDBModelConfig } from '../src/model';

config.update({
  region: 'us-east-1'
});

var db = new DynamoDB.DocumentClient({
  region: 'us-east-1'
});

describe('DynamoDBModel', () => {
  test('should be an object', () => {
    expect(typeof DynamoDBModel).toEqual('object');
  });

  describe('.config()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.config).toEqual('function');
    });

    test('should configure the static `DynamoDBModel` options', () => {
      expect(DynamoDBModel.getConfig().table).toBe(undefined);
      expect(DynamoDBModel.getConfig().tenant).toBe(undefined);
      expect(DynamoDBModel.getConfig().documentClient).toBe(undefined);
      var tenant = 'SomeTenant';
      var table = 'SomeTable';
      var documentClient = DynamoDBModel.config({
        table: 'SomeTable',
        tenant: 'SomeTenant',
        documentClient: db
      });
      expect(DynamoDBModel.getConfig().table).toBe(table);
      expect(DynamoDBModel.getConfig().tenant).toBe(tenant);
      expect(DynamoDBModel.getConfig().documentClient).toBe(db);
    });
  });

  var params: IDynamoDBModelConfig = {
    documentClient: db,
    hash: 'id',
    struct: {
      name: 'string'
    },
    table: 'TableTest'
  };

  describe('.create()', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.create).toEqual('function');
    });

    test('should return a function', () => {
      expect(typeof DynamoDBModel.create(params)).toEqual('function');
    });

    test('should return an instance of `DefaultModel`', () => {
      expect(DynamoDBModel.create(params)() instanceof DefaultModel).toBe(true);
    });
  });

  describe('.extend', () => {
    test('should be a function', () => {
      expect(typeof DynamoDBModel.extend).toBe('function');
    });

    test('should allow to create an extended model', () => {
      interface ICustomModel extends IDefaultModel {
        echo(value: string): string;
      }

      var CustomModel = DynamoDBModel.extend(params, model => {
        var Model = model as { new (): IDefaultModel };

        class CustomModel extends Model implements ICustomModel {
          constructor() {
            super();
          }

          echo(value: string): string {
            return value;
          }
        }

        return CustomModel;
      });

      var model: ICustomModel = CustomModel();
      var string = cuid();
      expect(model.echo(string)).toBe(string);
    });
  });
});
