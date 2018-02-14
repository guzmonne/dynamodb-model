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

**Simple Model**

```javascript
var SimpleModel = DynamoDBModel.createSimpleModel({
  hash: 'id',
  schema: {
    name: { type: 'string', required: true },
    age: { type: 'number' },
    adult: { type: 'boolean' },
    username: { type: 'string' }
  },
  indexes: {
    byName: {
      hash: 'name',
      range: 'createdAt'
    }
  }
  table: 'ProfilesTable',
  track: true // Tracks `createdAt` and `updatedAt` attributes
});

// Get
SimpleModel().get({ id: 'abc' });

// Create
SimpleModel().create({ id: 'abcd', name: 'John Doe' });

// Update
SimpleModel().update({
  id: 'abcd',
  name: 'Jane Doe',
  adult: true
});

// Delete
SimpleModel().delete({id: 'abc'});

// Index
SimpleModel().index({offset: {id: 'abc'}, limit: 10});

// Promise
model.promise()
  .then((data) => {
    /* ... */
  })
  .catch((err) => {
    /* ... */
  });;

// Callback
model.send((err, data) => {
  /* ... */
})
```

**Complex Model [TODO]**

```javascript
var ComplexModel = DynamoDBModel.createComplexModel({
  hash: 'id',
	schema: {
		name: { type: 'string', required: true },
    age: { type: 'number' },
    adult: {type: 'boolean'},
    username: {type: 'string'}
	},
	table: 'ProfilesTable',
	track: true // Tracks `createdAt` and `updatedAt` attributes
});

// Empty model
var defaultModel = ComplexModel();

// Create new item
defaultModel.create({name: 'John Doe'})
	.promise()
	.then(() => /* ... */ );

// Update an item
var updateModel = ComplexModel();
updateModel
  .set({id: '1', age: 24})
  .promise()
  .then(() => /* ... */);

// Multiple sets can be chained.
var chainedUpdateModel = ComplexModel();
chainedUpdateModel
  .set({id: '1', age: 24})
  .set({name: 'John Doe'})
  .set({adult: true})
  .promise()
  .then(() => /* ... */);

// Sets can be configured with functions
var setWithFunction = ComplexModel();
setWithFunction
  .set({id: '1', age: () => 12 * 2})
  .promise()
  .then(() => /* ... */);

// The data on the model can be accessed inside the set functions
var updateAfterGet = ComplexModel()
updateAfterGet
	.get({id: '1'})
	.set({age: (item) => item.age * 2})
	.promise()
  .then(() => /* ... */);

// Get a collection of items by ids
var itemCollectionByIds = ComplexModel.collection()
itemCollectionByIds  
  .get([{id: '1'}, {id: '2'}, {id: '3'}])
	.promise()
	.then(() => /* ... */);

// Get a collection of items using options
var itemCollectionByOptions = ComplexModel.collection()
itemCollectionByOptions  
  .get({ offset: 2, limit: 1 })
	.promise()
	.then(() => /* ... */)

// Update an entire collection.
var updateCollection = ComplexModel.collection()
updateCollection  
  .get([{id: '1'}, {id: '2'}, {id: '3'}])
	.filter(item => item.age > 18);
	.set({ adult: true })
	.promise()
  .then(() => /* ... */)

// Batch update models.
var updateCollection = ComplexModel.collection()
updateCollection  
  .get([{id: '1'}, {id: '2'}, {id: '3'}])
	.set({ username: 'one' }, { username: 'two' }, { username: 'three' })
	.promise()
  .then(() => /* ... */)

// Set functions are provided with the item, data, and index values
var updateCollection = ComplexModel.collection()
updateCollection  
  .get([{id: '1'}, {id: '2'}, {id: '3'}])
	.set({
    friends: (item, items, index) => (
      items.map(i => id).filter(i => i !== item.id)
    )
  })
	.promise()
  .then(() => /* ... */)

// Delete a model.
ComplexModel()
	.delete({id: '1'})
	.promise()
  .then(() => /* ... */);

// Delete a collection of items by ids
ComplexModel.collection()
  .delete([{id: '1'}, {id: '2'}, {id: '3'}])
	.promise()
	.then(() => /* ... */);
```
