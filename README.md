# fastify-ravendb

[![Package Version](https://img.shields.io/npm/v/fastify-ravendb.svg)](https://npm.im/fastify-ravendb)
[![CI](https://github.com/nearform/fastify-ravendb/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/fastify-ravendb/actions/workflows/ci.yml)

RavenDB plugin for Fastify. Internally it uses the official [ravendb](https://github.com/ravendb/ravendb-nodejs-client) and exposes the same `DocumentStore` across the whole Fastify application.

## Table of contents

- [fastify-ravendb](#fastify-ravendb)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Examples](#examples)
  - [Name option](#name-option)
  - [Docker](#docker)
  - [Testing](#testing)
  - [License](#license)

## Installation

```bash
npm i fastify-ravendb
```

## Usage

Register it as any other Fastify plugin. It will decorate your Fastify instance with the `rvn` (same name as RavenDB's CLI tool) object, and you can access and use it the same as you would do with any `DocumentStore` instance from the official RavenDB Node.js client.

Once the plugin is registered you can also enable automatic session handling for specific routes, via the `rvn.autoSession` route option. Sessions will be automatically open in the `onRequest` hook, requests will be decorated with the `rvn` object (the session, which you can use as with any session from the official client), and any pending changes will be saved `onResponse`.

### Plugin options

You can pass the following options when registering the plugin (all of them are optional unless stated otherwise):

| Parameter | Example | Description |
| --- | --- | --- |
| `name` | `'db1'` | Specific name for the `DocumentStore` instance. Please check [Name option](#name-option) for more information.
| `url` (required) | `'http://live-test.ravendb.net'` | RavenDB server URL. Same as in [ravendb#getting-started](https://github.com/ravendb/ravendb-nodejs-client#getting-started).
| `databaseName` (required) | `'test'` | Database name. Same as in [ravendb#getting-started](https://github.com/ravendb/ravendb-nodejs-client#getting-started).
| `authOptions` | `{ certificate: fs.readFileSync(certificate), type: 'pem' }` | Authentication options (i.e. certificate and password). Same as in [ravendb#working-with-secured-server](https://github.com/ravendb/ravendb-nodejs-client#working-with-secured-server).
| `findCollectionNameForObjectLiteral` | `e => e._collection` | A function to extract the target collection from an object literal entity. Same as in [ravendb#using-object-literals-for-entities](https://github.com/ravendb/ravendb-nodejs-client#using-object-literals-for-entities).

### Route options

You can pass these options when creating routes (all of them are optional):

| Parameter | Examples | Description |
| --- | --- | --- |
| `rvn.autoSession` | `true` \|  `'test'` \| `['local', 'external']` | Whether to open sessions automatically for specific database instances. It can be a boolean to target the global instance, or a string/array of strings to target one or multiple named instances. Please check [Name option](#name-option) for more information. |

## Examples

### Basic example

```javascript
import Fastify from 'fastify'
import plugin from 'fastify-ravendb'

class Person {
  constructor(name) {
    this.name = name
  }
}

const routeOptions = { rvn: { autoSession: true } }

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, {
    url: 'http://live-test.ravendb.net/',
    databaseName: 'test'
  })

  fastify.post('/people', routeOptions, async (req, reply) => {
    const person = new Person(req.body.name)

    await req.rvn.store(person)

    reply.send(person)
  })

  fastify.get('/people/:id', routeOptions, async (req, reply) => {
    const person = await req.rvn.load(`people/${req.params.id}`, Person)

    reply.send(person)
  })

  await fastify.listen({ port: 3000 })
}

start()
```

### Advanced examples

More advanced examples are provided in the [examples folder](examples/).

They require you to start the RavenDB Docker container provided in this repo. Please check [Docker](#docker) for more information.

## Name option

Heavily inspired by [@fastify-postgres](https://github.com/fastify/fastify-postgres/). You can have multiple `DocumentStore` instances living together inside the Fastify namespace, and name them by passing the `name` parameter when registering each instance of the plugin.

```javascript
import plugin from 'fastify-ravendb'

await fastify.register(plugin, {
  name: 'db1',
  url: 'http://live-test.ravendb.net/',
  databaseName: 'test'
})

await fastify.register(plugin, {
  name: 'db2',
  url: 'http://some-other-server.net/',
  databaseName: 'test2'
})
```

## Docker

A RavenDB Docker container with a database fixture named `test` has been provided for running tests which require a real database and for using the advanced examples.

### Run

You can start the container by simply running this command, provided that you have Docker available:
```bash
npm run docker
```

It will output something similar to this:
```bash
> fastify-ravendb@1.0.0 docker /Users/brianbaidal/Documents/git/fastify-ravendb
> npm run docker:run && npm run docker:data && npm run docker:url


> fastify-ravendb@1.0.0 docker:run /Users/brianbaidal/Documents/git/fastify-ravendb
> docker run -p $npm_package_config_docker_port:8080 --name fastify-ravendb -e RAVEN_ARGS='--Setup.Mode=None' -e RAVEN_Security_UnsecuredAccessAllowed=PublicNetwork -d ravendb/ravendb:ubuntu-latest

5df67a5eb2783e177d59c286e10150c71518def06beed05bceca3c3ef0166ede

> fastify-ravendb@1.0.0 docker:data /Users/brianbaidal/Documents/git/fastify-ravendb
> ./scripts/create-data.sh $npm_package_config_docker_port

{"RaftCommandIndex":2,"Name":"test","Topology":{"Members":["A"],"Promotables":[],"Rehabs":[],"Stamp":{"Index":2,"Term":1,"LeadersTicks":-2},"NodesModifiedAt":"2022-09-19T13:56:10.8938260Z","PromotablesStatus":{},"DemotionReasons":{},"DynamicNodesDistribution":false,"ReplicationFactor":1,"DatabaseTopologyIdBase64":"9iRu52Sau02gwkZkYZGCKQ","ClusterTransactionIdBase64":"m7lPdRLMGkqeuGb/XHItvg","PriorityOrder":[]},"NodesAddedTo":["http://4bf4401dd524:8080"]}{"Results":[{"Type":"PUT","@id":"test","@collection":"@empty","@change-vector":"A:1-m6zmrzFDFECF1rltvWzY+A","@last-modified":"2022-09-19T13:56:11.4895130Z"}]}
> fastify-ravendb@1.0.0 docker:url /Users/brianbaidal/Documents/git/fastify-ravendb
> echo You can access RavenDB Management Studio on http://localhost:$npm_package_config_docker_port

You can access RavenDB Management Studio on http://localhost:8080
```

### Remove

When you're done you can remove the container by running this:
```bash
npm run docker:remove
```

### Admin

You can conveniently access [RavenDB CLI](https://ravendb.net/docs/article-page/4.0/csharp/server/administration/cli)'s admin channel running this while the container is up:
```bash
npm run docker:admin
```

### Change port

If port `8080` is already allocated in your system, you can change the `config.docker.port` attribute in the package.json, then remove the container and start it again.

### Reset fixtures

If at some point you want to reset the fixtures you can remove the container and start again.

## Testing

In order to run the tests first you'll need to start the provided Docker container. Please check [Docker](#docker) for more information.

While the container is up you can run the tests with `npm test`.

## License

Copyright NearForm Ltd. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).