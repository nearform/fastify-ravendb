import { test } from 'tap'
import { DocumentStore } from 'ravendb'
import Fastify from 'fastify'

import plugin from '../index.js'
import { url, databaseName } from './helpers.js'

test('Should register with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  t.hasProp(fastify, 'rvn')
  t.ok(fastify.rvn instanceof DocumentStore)
})

test('Should register with name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  t.hasProp(fastify, 'rvn')
  t.notOk(fastify.rvn instanceof DocumentStore)
  t.hasProp(fastify.rvn, 'extra')
  t.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should register with both no name and name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })
  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  t.hasProp(fastify, 'rvn')
  t.ok(fastify.rvn instanceof DocumentStore)
  t.hasProp(fastify.rvn, 'extra')
  t.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should register with both name and no name (same as previous, but in reverse order)', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })
  await fastify.register(plugin, { url, databaseName })

  t.hasProp(fastify, 'rvn')
  t.notOk(fastify.rvn instanceof DocumentStore)
  t.hasProp(fastify.rvn, 'extra')
  t.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should throw when register is called twice with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  t.rejects(fastify.register(plugin, { url, databaseName }))
})

test('Should throw when register is called twice with the same name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  t.rejects(fastify.register(plugin, { url, databaseName, name: 'extra' }))
})

test('Should throw when register is called with a reserved name', async t => {
  const fastify = Fastify()

  t.rejects(fastify.register(plugin, { url, databaseName, name: 'initialize' }))
})

test('Should register with a custom collection mapping function', async t => {
  const findCollectionNameForObjectLiteral = e => e.collection

  const fastify = Fastify()

  await fastify.register(plugin, {
    url,
    databaseName,
    findCollectionNameForObjectLiteral
  })

  t.match(
    fastify.rvn.conventions.findCollectionNameForObjectLiteral,
    findCollectionNameForObjectLiteral
  )
})
