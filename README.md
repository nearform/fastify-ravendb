# fastify-ravendb

[![Package Version](https://img.shields.io/npm/v/fastify-ravendb.svg)](https://npm.im/fastify-ravendb)
[![CI](https://github.com/nearform/fastify-ravendb/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/fastify-ravendb/actions/workflows/ci.yml)

RavenDB plugin for Fastify. Internally it uses the official [ravendb](https://github.com/ravendb/ravendb-nodejs-client) and exposes the same `DocumentStore` across the whole Fastify application.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Basic example](#basic-example)
- [Advanced examples](#advanced-examples)
- [Name option](#name-option)
- [Docker](#docker)
- [License](#license)

## Installation

```bash
npm i fastify-ravendb
```

## Usage

Register it as any other Fastify plugin. It will add the `rvn` (same name as RavenDB's CLI tool) namespace to your Fastify instance. You can access and use it the same as you would do with any `DocumentStore` instance from the official RavenDB Node.js client.

You can pass the following options when registering the plugin (all of them are optional unless stated otherwise):

| Parameter | Example | Description |
| --- | --- | --- |
| `name` | `db1` | Specific name for the `DocumentStore` instance. Please check [Name option](#name-option) for more information.
| `url` (required) | `http://live-test.ravendb.net` | RavenDB server URL. Same as in [ravendb#getting-started](https://github.com/ravendb/ravendb-nodejs-client#getting-started).
| `databaseName` (required) | `test` | Database name. Same as in [ravendb#getting-started](https://github.com/ravendb/ravendb-nodejs-client#getting-started).
| `authOptions` | `{ certificate: fs.readFileSync(certificate), type: 'pem' }` | Authentication options (i.e. certificate and password). Same as in [ravendb#working-with-secured-server](https://github.com/ravendb/ravendb-nodejs-client#working-with-secured-server).
| `findCollectionNameForObjectLiteral` | `e => e._collection` | A function to extract the target collection from an object literal entity. Same as in [ravendb#using-object-literals-for-entities](https://github.com/ravendb/ravendb-nodejs-client#using-object-literals-for-entities).

## Basic example

```javascript
import Fastify from 'fastify'
import plugin from 'fastify-ravendb'

export class Person {
  constructor(name) {
    this.name = name
  }
}

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, {
    url: 'http://live-test.ravendb.net/',
    databaseName: 'test'
  })

  fastify.post('/people', async (req, reply) => {
    const person = new Person(req.body.name)

    const session = fastify.rvn.openSession()
    await session.store(person, Person)
    await session.saveChanges()

    reply.send(person)
  })

  fastify.get('/people/:id', async (req, reply) => {
    const session = fastify.rvn.openSession()
    const person = await session.load(`people/${req.params.id}`, Person)

    reply.send(person)
  })

  await fastify.listen({ port: 3000 })
}

start()
```

## Advanced examples

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

A RavenDB Docker container with a database fixture named `test` has been provided for convenience and for using the advanced examples.

### Run

You can start the container by simply running this command, provided that you have Docker available:
```bash
npm run docker
```

It will output something similar to this:
```bash
> fastify-ravendb@0.0.1 docker
> npm run docker:data && npm run docker:run


> fastify-ravendb@0.0.1 docker:data
> rm -rf ravendb-data && tar -xf ravendb-data.tgz


> fastify-ravendb@0.0.1 docker:run
> docker run -p $npm_package_config_docker_port:8080 --name fastify-ravendb -e RAVEN_ARGS='--Setup.Mode=None' -e RAVEN_Security_UnsecuredAccessAllowed=PublicNetwork -v $(pwd)/ravendb-data:/opt/RavenDB/Server/RavenData -d ravendb/ravendb:ubuntu-latest && npm run docker:url

914aa14b8bbdafc858010ef92e9df32882f4ca14e96912c3d6030d97b04f59ee

> fastify-ravendb@0.0.1 docker:url
> echo You can access RavenDB Management Studio on http://localhost:$npm_package_config_docker_port

You can access RavenDB Management Studio on http://localhost:8080
```

### Remove

When you're done you can remove the container by running this:
```bash
npm run docker:remove
```

### Change port

If port `8080` is already allocated in your system, you can change the `config.docker.port` attribute in the package.json, then remove the container and start it again.

### Reset fixtures

If at some point you want to reset the fixtures it can be done running this (without the container running):
```bash
npm run docker:data
```

## License

Copyright NearForm Ltd. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).