# DynamoDB Models

The AWS JavaScript SDK provides access to DynamoDB without restrains. You can accomplish a lot just by using it, but sometimes, you need to constrain this access, to avoid errors, or you need some functionality that is not directly available on the SDK. This library aims to solve some of these problems by providing a framework that provides:

* The ability to configure a top-level schema.
* CRUD methods for easy access.
* The ability to extend the base model to include your methods.
* The ability to handle a `tenant` attribute that would allow to segment the information of multiple clients on the same table.

## Getting Started

Before we can start defining our models, we should configure the library:

```javascript
var DynamoDBModel = require('dynamodb-model');
DynamoDBModel.config({
  tenant: process.env.TENANT,
  documentClient: new AWS.DynamoDB.DocumentClient(),
  table: process.env.DEFAULT_TABLE
});
```

If the `config()` method is not run, the `tenant` value is going to be empty. Also, if the `documentClient` option is undefined, the library tries to create an `AWS.DynamoDB.DocumentClient` instance. The `table` option is useful if you are planning to store all the items on a single table, or if you want to use it as default. If you do not provide a `table` value as default, you must configure it as a static
Now we can define default instances of the models, or extend the `Base` class to include our logic.

**Default model instance.**

```javascript
var DefaultModel = DynamoDBModel({
  hash: 'id',
  range: 'createdAt',
	schema: {
		name: { type: 'string' },
		age: { type: 'number' },
	},
	table: 'ProfilesTable',
	track: true // Tracks `createdAt` and `updatedAt` attributes
});

// Empty model
var defaultModel = DefaultModel();

// Create new item
defaultModel.create({name: 'John Doe'})
	.promise()
	.then(() => /* ... */ );

// Get item by id and update its values
var itemById = DefaultModel()
itemById
	.get(1)
	.set({age: 23})
	.promise()
	.then(() => /* ... */);

// Get a collection of items by ids
var itemCollectionByIds = DefaultModel.collection()
itemCollectionByIds  
  .get([1, 2, 3])
	.promise()
	.then(() => /* ... */);

// Get a collection of items using options
var itemCollectionByOptions = DefaultModel.collection()
itemCollectionByOptions  
  .get({ offset: 2, limit: 1 })
	.promise()
	.then(() => /* ... */)

// Update an entire collection.
var updateCollection = DefaultModel.collection()
updateCollection  
  .get([1, 2, 3])
	.filter(item => item.age > 18);
	.set({ adult: true })
	.promise()
   	.then(() => /* ... */)
```
