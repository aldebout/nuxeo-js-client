## Client Library for Nuxeo API

[![Build Status](https://qa.nuxeo.org/jenkins/buildStatus/icon?job=nuxeo-js-client-master&style=flat)](http://qa.nuxeo.org/jenkins/job/nuxeo-js-client-master)
[![npm version](https://img.shields.io/npm/v/nuxeo.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo)
[![npm downloads](https://img.shields.io/npm/dm/nuxeo.svg?style=flat-square)](https://www.npmjs.com/package/nuxeo)
[![Dependency Status](https://img.shields.io/david/nuxeo/nuxeo-js-client.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-js-client) [![devDependency Status](https://img.shields.io/david/dev/nuxeo/nuxeo-js-client.svg?style=flat-square)](https://david-dm.org/nuxeo/nuxeo-js-client#info=devDependencies)

The Nuxeo JavaScript Client is a JavaScript client library for the Nuxeo Automation and REST API. The library can work in a browser, or in Node.js, using the same API.

This is an on-going project, supported by Nuxeo.

## Getting Started

### Installation

#### Node.js Applications

After installing [Node.js](http://nodejs.org/#download), use `npm` to install the `nuxeo` package:

    $ npm install nuxeo --save

Then, use the following `require` statement to have access to the same API than the browser client:

```javascript
var Nuxeo = require('nuxeo');
var nuxeo = new Nuxeo();
```

#### Bower Powered Applications

The `nuxeo` client can be also installed through bower:

    $ bower install nuxeo --save

When added to your page, `Nuxeo` is available as a global variable.

```javascript
var nuxeo = new Nuxeo();
```

#### Angular Applications

After adding `nuxeo` through Bower, you can easily create a service that will return a client:

```javascript
...
.service('nuxeo', function() {
  return new Nuxeo({
    baseURL: 'http://localhost:8080/nuxeo/',
    auth: {
      method: 'basic',
      username: 'Administrator',
      password: 'Administrator'
    }
  });
})
...
```

To notify Angular to update the UI when a Nuxeo promise has resolved, you can either wrap Nuxeo promises in `$q.when()`
or, the preferred way, configure the Promise library class to be `$q`.

```javascript
// wrap promises
...
$q.when(nuxeo.request('/path/').get()).then(function(res) {
  $scope.res = res;
});
// use $q as the Promise library class
...
.service('nuxeo', function($q) {
  Nuxeo.promiseLibrary($q);
  return new Nuxeo({
    baseURL: 'http://localhost:8080/nuxeo/',
    auth: {
      method: 'basic',
      username: 'Administrator',
      password: 'Administrator'
    }
  });
})
...
```

## Requirements

The Nuxeo JavaScript client works only with Nuxeo Platform >= LTS 2015.

## Quick Start

This quick start guide will show how to do basics operations using the client.

### Creating a Client

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'basic',
    username: 'Administrator',
    password: 'Administrator'
  },
});
```

To connect to a different Nuxeo Platform Instance, you can use the following:

```javascript
var nuxeo = new Nuxeo({
  auth: {
    method: 'basic',
    baseURL: 'http://demo.nuxeo.com/nuxeo/',
    username: 'Administrator',
    password: 'Administrator'
  },
});
```

### Promise Based Calls

All API calls return a Promise object:

```javascript
nuxeo.operation('Document.GetChildren')
  .execute()
  .then(function(docs) {
    // work with docs
  })
  .catch(function(error) {
    // something went wrong
    throw error;
  });
```

When something went wrong, the `error` is an `Error` object with a `response` field containing the whole response.

### Operation

`Operation` object allows you to execute an operation
(or operation chain).

#### Samples

Calling an operation to create a new folder in the Root document:

```javascript
nuxeo.operation('Document.Create')
  .params({
    type: 'Folder',
    name: 'My Folder',
    properties: 'dc:title=My Folder \ndc:description=A Simple Folder'
  })
  .input('/')
  .execute()
  .then(function(doc) {
      console.log('Created ' + doc.title + ' folder');
  })
  .catch(function(error) {
    throw error;
  });
```

### Request

The `Request` object allows you to call the Nuxeo REST API.

#### Samples

Fetching the Administrator user:

```javascript
nuxeo.request('user/Administrator')
  .get()
  .then(function(user) {
    console.log(user);
  })
  .catch(function(error) {
    throw error;
  });
```

Fetching the whole list of Natures:

```javascript
nuxeo.request('directory/nature')
  .get()
  .then(function(data) {
    console.log(JSON.stringify(data.entries, null, 2))
  })
  .catch(function(error) {
    throw error
  });
```

### Repository API

The `Repository` object allows you to work with document.

#### Samples

Creating a `Repository` object:

```javascript
var defaultRepository = nuxeo.repository(); // 'default' repository
...
var testRepository = nuxeo.repository('test'); // 'test' repository
...
```

Fetching the Root document:

```javascript
nuxeo.repository().fetch('/')
  .then(function(doc) {
    console.log(doc);
  })
  .catch(function(error) {
    throw error;
  });
```

Creating a new folder:

```javascript
var newFolder = {
  'entity-type': 'document',
  name: 'a-folder',
  type: 'Folder',
  properties: {
    'dc:title': 'foo',
  },
};
nuxeo.repository()
  .create('/', newFolder)
  .then(function(doc) {
    console.log(doc);
  })
  .catch(function(error) {
    throw error;
  });
```

Deleting a document:

```javascript
nuxeo.repository()
  .delete('/a-folder')
  .then(function(res) {
    // res.status === 204
  });
```

### Document

`Repository` object returns and works with `Document` objects. `Document` objects exposes a simpler API
to work with a document.

#### Samples

Retrieving a `Document` object:

```javascript
nuxeo.repository()
  .fetch('/')
  .then(function(doc) {
    // doc instanceof Nuxeo.Document === true
  })
  .catch(function(error) {
    throw error;
  });
```

Set a document property:

```javascript
doc.set({ 'dc:title': 'foo' });
```

Get a document property:

```javascript
doc.get('dc:title');
```

Save an updated document:

```javascript
nuxeo.repository()
  .fetch('/')
  .then(function(doc) {
    // doc.title !== 'foo'
    doc.set({ 'dc:title': 'foo' });
    return doc.save();
  })
  .then(function(doc) => {
    // doc.title === 'foo'
  })
  .catch(function(error) {
    throw error;
  });
```

### BatchUpload

The `BatchUpload` object allows you to upload blobs to a Nuxeo Platform instance, and use them as operation input or
as document property value.

#### Samples

Create a Nuxeo.Blob to be uploaded:

```javascript
// on the browser, assuming you have a File object 'file'
var blob = new Nuxeo.Blob({ content: file });
// the name, mimeType and size will be extracted from the file object itself, you can still override them.
...
// on Node.js, assuming you have a Stream 'file'
var blob = new Nuxeo.Blob({ content: file, name: 'foo.txt', mimeType: 'plain/text', size: 10 })
```

Upload a blob:

```javascript
nuxeo.batchUpload()
  .upload(blob)
  .then(function(res) {
    // res.blob instanceof Nuxeo.BatchBlob
    console.log(res.blob);
  })
  .catch(function(error) {
    throw error;
  });
```

Attach an uploaded blob to a document:

```javascript
nuxeo.batchUpload()
  .upload(blob)
  .then(function(res) {
    return nuxeo.operation('Blob.AttachOnDocument')
      .param('document', '/a-file')
      .input(res.blob)
      .execute({ schemas: ['dublincore', 'file']});
  })
  .then(function(doc) {
    console.log(doc.properties[file:content]);
  })
  .catch(function(error) {
    throw error;
  });
```

## Contributing

See our [contribution documentation](https://doc.nuxeo.com/x/VIZH).

### Requirements

* [Node.js](http://nodejs.org/#download)
* [gulp](http://gulpjs.com/)
* [Bower](http://bower.io/)
* [npm](https://www.npmjs.com/)

### Setup

Install [Node.js](http://nodejs.org/#download) and then use `npm` to install all the required
libraries:

    $ git clone https://github.com/nuxeo/nuxeo-js-client
    $ cd nuxeo-js-client
    $ npm install

### Test

A Nuxeo Platform instance needs to be running on `http://localhost:8080/nuxeo` for the tests to be run.

Tests can be launched on Node.js with:

    $ gulp test:node

For testing the browser client (tests are run on Firefox and Chrome by default):

    $ gulp test:browser

To run both Node.js and browser tests:

    $ gulp test


### Reporting Issues

You can follow the developments in the Nuxeo JS Client project of our JIRA bug tracker: [https://jira.nuxeo.com/browse/NXJS](https://jira.nuxeo.com/browse/NXJS).

You can report issues on [answers.nuxeo.com](http://answers.nuxeo.com).

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt) Copyright (c) Nuxeo SA


## About Nuxeo

Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. Combining a powerful application development environment with SaaS-based tools and a modular architecture, the Nuxeo Platform and Products provide clear business value to some of the most recognizable brands including Verizon, Electronic Arts, Netflix, Sharp, FICO, the U.S. Navy, and Boeing. Nuxeo is headquartered in New York and Paris. More information is available at [www.nuxeo.com](http://www.nuxeo.com/).
