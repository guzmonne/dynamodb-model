var { documentClient } = require('./aws');
var { DynamoDBModel } = require('../dist/');

var config = {
  documentClient,
  table: 'DynamoDBUserModel',
  hash: 'id',
  struct: {
    name: 'string',
    age: 'number?'
  },
  maxGSIK: 20,
  track: true
};

var UserModel = DynamoDBModel.extend(config, model => {
  class UserModel extends model {
    constructor() {
      super();
    }

    count() {
      this.call = () =>
        this.index()
          .promise()
          .then(results => results.count);

      return this;
    }
  }

  return UserModel;
});

var createModel = UserModel().create({
  name: 'John Doe'
});

var countModel = UserModel().count();

async function main() {
  try {
    console.log(
      'Creating a new user',
      JSON.stringify(await createModel.promise(), null, 2)
    );
    console.log(
      'Getting user count',
      JSON.stringify(await countModel.promise(), null, 2)
    );
  } catch (error) {
    console.log(error);
  }
}

main();
