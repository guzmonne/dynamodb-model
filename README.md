# DynamoDB Simple Model

The AWS JavaScript SDK provides access to DynamoDB without restrains. You can accomplish a lot just by using it, but sometimes, you need to constrain this access, to avoid errors, or you need some functionality that is not directly available on the SDK. This library aims to solve some of these problems by providing a framework that provides:

* The ability to configure a top-level schema.
* CRUD methods for easy access.
* The ability to extend the base model to include your methods.
* The ability to handle a `tenant` attribute that would allow to segment the information of multiple clients on the same table.

## Install

You can get the code through `npm` or `yarn`.

```
yarn add dynamodb-simple-model

npm install dynamodb-simple-model
```

[Here is the link to the NPM site.](https://www.npmjs.com/package/dynamodb-simple-model)

## Getting Started

Before we can start defining our models, we should configure the library:

```javascript
var { DynamoDBModel } = require('dynamodb-simple-model');

DynamoDBModel.config({
  tenant: process.env.TENANT,
  documentClient: new AWS.DynamoDB.DocumentClient(),
  table: process.env.DEFAULT_TABLE
});
```

If the `config()` method is not run, the `tenant` value is going to be empty. Also, if the `documentClient` option is undefined, the library tries to create an `AWS.DynamoDB.DocumentClient` instance. The `table` option is useful if you are planning to store all the items on a single table, or if you want to use it as default. If you do not provide a `table` value as default, you must configure it as a static
Now we can define default instances of the models, or extend the `Base` class to include our logic.

### Create a default Model

```javascript
import { btoa } from 'dynamodb-simple-models/dist/utils';

var UserModel = DynamoDBModel.create({
  hash: 'id',
  struct: {
    name: 'string',
    age: 'number?',
    adult: 'boolean?'
    username: 'string?'
  },
  maxGSIK: 1, // Configures the maximum GSIK value. It is 10 by default.
  indexName: 'ByTenant'
  table: 'UserTable',
  track: true // Tracks `createdAt` and `updatedAt` attributes
});

// Get
UserModel().get({ id: 'abc' });

// Create
UserModel().create({ id: 'abcd', name: 'John Doe' });

// Update
UserModel().update({
  id: 'abcd',
  name: 'Jane Doe',
  adult: true
});

// Delete
UserModel().delete({id: 'abc'});

// Index
/**
 * Offset values are handled as base64 encoded DynamoDB.DocumentClient keys.
 * This is to simplify the handling of the offset values. There are some helper
 * functions that can be taken from this library that can encode and decode
 * base64 strings on NodeJS.
 */
UserModel().index({
  offset: btoa(JSON.stringify({0: {id: 'abc'}})),
  limit: 10
});

// All the methods described before are lazily evaluated. Meaning they won't run
// until you call the `promise()` or `callback` methods on them.

// Promise
model.promise()
  .then((data) => {
    /* ... */
  })
  .catch((err) => {
    /* ... */
  });;

// Callback
model.callback((err, data) => {
  /* ... */
})
```

### Extend the default model

To extend the default model you can use the `extend` function. It takes the configuration parameters needed to configure the default model, and a function that provides the model, and returns an extended model class. You can then use all the methods define on the default model, and your own, the same way as explained before.

```javascript
var { DynamoDBModel } = require('dynamodb-simple-model');

var config = {
  hash: 'id',
  struct: {
    name: 'string',
    age: 'number?',
    adult: 'boolean?'
    username: 'string?'
  },
  maxGSIK: 1, // Configures the maximum GSIK value. It is 10 by default.
  indexName: 'ByTenant'
  table: 'UserTable',
  track: true // Tracks `createdAt` and `updatedAt` attributes
};

var CustomModel = DynamoDBModel.extend(params, model => {
  class CustomModel extends model {
    constructor() {
      super();
    }

    echo(value: string): string {
      return value;
    }
  }

  return CustomModel;
});

CustomModel().echo('Something');
// >>> 'Something'
```

If you are using Typescript then you might want to create the interface that the new class will implement, which should inherit `IDefaultModel`. You can then cast the created model to this interface to help Typescript out.

```typescript
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
model.echo('something');
// >>> something
```

## Examples

On the examples folder you can see how you can interact with the default model and how to extend it to include methods of your own. I recommend you run the examples using [Dynalite](https://github.com/mhart/dynalite) which is a great tool to run DynamoDB locally.

Running the `setup.js` script will create the example table on the DynamoDB instance you provide. By default, it will try to get a Dynalite instance working on port 8989.

```
node examples/setup.js
```

You can then see the library in action by running:

```
node examples/default_model.js

node examples/custom_model.js
```

If you would like to see or offer more examples let me know.

## Tests

To run the tests you must have [`jest`](https://facebook.github.io/jest/) installed globally or run `yarn install` to install it locally.

Then run `yarn test` or `npm test` to see the results.

## LICENCE

MIT
