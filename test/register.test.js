import Fastify from 'fastify'
import { test } from 'node:test'
import { DocumentStore } from 'ravendb'
import sinon from 'sinon'

import plugin from '../index.js'
import { databaseName, url } from './constants.js'

test('Should register with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  t.assert.ok(fastify.rvn instanceof DocumentStore)
})

test('Should register with name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  t.assert.ok(!(fastify.rvn instanceof DocumentStore))
  t.assert.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should register with both no name and name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })
  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  t.assert.ok(fastify.rvn instanceof DocumentStore)
  t.assert.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should register with both name and no name (same as previous, but in reverse order)', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })
  await fastify.register(plugin, { url, databaseName })

  t.assert.ok(!(fastify.rvn instanceof DocumentStore))
  t.assert.ok(fastify.rvn.extra instanceof DocumentStore)
})

test('Should throw when register is called twice with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  await t.assert.rejects(
    async () => await fastify.register(plugin, { url, databaseName })
  )
})

test('Should throw when register is called twice with the same name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  await t.assert.rejects(
    async () =>
      await fastify.register(plugin, { url, databaseName, name: 'extra' })
  )
})

test('Should throw when register is called with a reserved name', async t => {
  const fastify = Fastify()

  await t.assert.rejects(
    async () =>
      await fastify.register(plugin, { url, databaseName, name: 'initialize' })
  )
})

test('Should register with a custom collection mapping function', async t => {
  const findCollectionNameForObjectLiteral = e => e.collection

  const fastify = Fastify()

  await fastify.register(plugin, {
    url,
    databaseName,
    findCollectionNameForObjectLiteral
  })

  t.assert.deepStrictEqual(
    fastify.rvn.conventions.findCollectionNameForObjectLiteral,
    findCollectionNameForObjectLiteral
  )
})

test('Should be disposed on close', async () => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  const disposeSpy = sinon.spy(fastify.rvn, 'dispose')

  await fastify.close()

  sinon.assert.calledOnce(disposeSpy)
})
