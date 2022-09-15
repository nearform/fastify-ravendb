import fastify from 'fastify'
import { IDocumentStore } from 'ravendb'
import { expectAssignable, expectType } from 'tsd'

import plugin from '../../index'

const app = fastify()

// Without parameters
app.register(plugin)

// Mandatory parameters
app.register(plugin, { url: 'http://localhost', databaseName: 'test' })

// Multiple instances
app.register(plugin, { url: 'http://localhost', databaseName: 'test', name: 'categories' })
app.register(plugin, { url: 'http://localhost', databaseName: 'test', name: 'people' })

// Auth options
app.register(plugin, {
  url: 'http://localhost',
  databaseName: 'test',
  authOptions: {
    certificate: 'certificate',
    password: 'password'
  }
})

// Plugin property available
app.after(() => {
  expectAssignable<IDocumentStore>(app.rvn)
  expectType<IDocumentStore>(app.rvn.categories)
  expectType<IDocumentStore>(app.rvn.people)
})
