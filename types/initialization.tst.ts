import fastify from 'fastify'
import { IDocumentStore } from 'ravendb'
import { expect } from 'tstyche'

import plugin from './index.js'

const app = fastify()

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
  expect(app.rvn).type.toBeAssignableTo<IDocumentStore>()
  expect(app.rvn['categories']!).type.toBeAssignableTo<IDocumentStore>()
  expect(app.rvn['people']!).type.toBeAssignableTo<IDocumentStore>()
})
