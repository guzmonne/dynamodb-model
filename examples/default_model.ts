import * as cuid from 'cuid';
import { documentClient } from './setup';
import { DynamoDBModel } from '../dist/';
import { IDynamoDBModelConfig } from '../src/model';

var tenant = cuid();

var config: IDynamoDBModelConfig = {
  documentClient,
  table: 'DynamoDBUserModel',
  hash: 'id',
  struct: {
    name: 'string',
    age: 'number?'
  },
  tenant,
  maxGSIK: 20,
  track: true
};

var UserModel = DynamoDBModel.create(config);

var createModel = UserModel().create({
  name: 'John Doe'
});

var getModel = id => UserModel().get({ id });

var updateModel = id => UserModel().update({ id, age: 12 });

var indexModel = UserModel().index();

var deleteModel = id => UserModel().delete({ id });

async function main() {
  try {
    var result = await createModel.promise();
    var id = result.id;
    console.log('Creating a new user', JSON.stringify(result, null, 2));
    console.log(
      `Getting the user`,
      JSON.stringify(await getModel(id).promise(), null, 2)
    );
    console.log(
      `Updating the user`,
      JSON.stringify(await updateModel(id).promise(), null, 2)
    );
    console.log(
      `Getting list of users`,
      JSON.stringify(await indexModel.promise()),
      null,
      2
    );
    console.log(
      `Deleting the user`,
      JSON.stringify(await deleteModel(id).promise(), null, 2)
    );
  } catch (error) {
    console.log(error);
  }
}

main();
